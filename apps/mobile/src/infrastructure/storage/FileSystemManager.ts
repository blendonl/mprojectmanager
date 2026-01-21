/**
 * File System Manager for MKanban mobile app
 * Wraps expo-file-system operations and provides utility methods
 * Simplified to use internal storage only - backend integration for data persistence
 */

import * as FileSystem from 'expo-file-system/legacy';
import { getSafeFilename } from "../../utils/stringUtils";
import { FileSystemObserver } from "../../core/FileSystemObserver";
import { logger } from "../../utils/logger";

export type NoteType = 'general' | 'meetings' | 'daily';

export class FileSystemManager {
  private baseDirectory: string;
  private customDataDirectory?: string;
  private observers: Set<FileSystemObserver> = new Set();
  private initialized: boolean = false;

  constructor(baseDirectory?: string) {
    const docDir = FileSystem.documentDirectory || '';
    this.baseDirectory = baseDirectory || docDir.endsWith('/') ? docDir.slice(0, -1) : docDir;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.debug('[FileSystemManager] Already initialized');
      return;
    }

    logger.debug('[FileSystemManager] Starting initialization...');
    logger.debug('[FileSystemManager] Setting up internal storage...');

    try {
      await this.ensureDirectoryExists(this.getDataDirectory());
      logger.debug('[FileSystemManager] Internal storage directory created:', this.getDataDirectory());
    } catch (error) {
      logger.error('[FileSystemManager] Failed to create internal storage directory:', error);
      throw new Error(`Failed to initialize file system: ${error}`);
    }

    this.initialized = true;
    logger.debug('[FileSystemManager] Initialization complete');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getDataDirectory(): string {
    if (this.customDataDirectory) {
      return this.customDataDirectory;
    }
    return `${this.baseDirectory}/mkanban/`;
  }

  setDataDirectory(path: string): void {
    if (!path || typeof path !== 'string') {
      throw new Error('Data directory path cannot be empty');
    }
    const normalizedPath = path.endsWith('/') ? path : `${path}/`;
    this.customDataDirectory = normalizedPath;
  }

  getProjectsDirectory(): string {
    return `${this.getDataDirectory()}projects/`;
  }

  getProjectDirectory(projectSlug: string): string {
    const safeSlug = getSafeFilename(projectSlug);
    return `${this.getProjectsDirectory()}${safeSlug}/`;
  }

  getProjectBoardsDirectory(projectSlug: string): string {
    return `${this.getProjectDirectory(projectSlug)}boards/`;
  }

  getProjectNotesDirectory(projectSlug: string, noteType?: NoteType): string {
    const notesDir = `${this.getProjectDirectory(projectSlug)}notes/`;
    if (noteType) {
      return `${notesDir}${noteType}/`;
    }
    return notesDir;
  }

  getProjectTimeDirectory(projectSlug: string): string {
    return `${this.getProjectDirectory(projectSlug)}time/logs/`;
  }

  getGlobalDirectory(): string {
    return `${this.getDataDirectory()}global/`;
  }

  getGoalsDirectory(): string {
    return `${this.getGlobalDirectory()}goals/`;
  }

  getGlobalNotesDirectory(noteType?: NoteType): string {
    const notesDir = `${this.getGlobalDirectory()}notes/`;
    if (noteType) {
      return `${notesDir}${noteType}/`;
    }
    return notesDir;
  }

  getAgendaDirectory(): string {
    return `${this.getDataDirectory()}agenda/`;
  }

  getAgendaYearDirectory(year: string | number): string {
    return `${this.getAgendaDirectory()}${year}/`;
  }

  getAgendaMonthDirectory(year: string | number, month: string | number): string {
    const monthStr = month.toString().padStart(2, '0');
    return `${this.getAgendaYearDirectory(year)}${monthStr}/`;
  }

  getAgendaDayDirectory(year: string | number, month: string | number, day: string | number): string {
    const dayStr = day.toString().padStart(2, '0');
    return `${this.getAgendaMonthDirectory(year, month)}${dayStr}/`;
  }

  getAgendaDayDirectoryFromDate(date: string): string {
    const [year, month, day] = date.split('-');
    return this.getAgendaDayDirectory(year, month, day);
  }

  async listProjects(): Promise<string[]> {
    try {
      const projectsDir = this.getProjectsDirectory();
      const dirExists = await this.directoryExists(projectsDir);
      if (!dirExists) {
        return [];
      }

      const subdirs = await this.listDirectories(projectsDir);
      const projects: string[] = [];

      for (const subdirPath of subdirs) {
        const projectMdPath = `${subdirPath}project.md`;
        const exists = await this.fileExists(projectMdPath);
        if (exists) {
          const projectSlug = subdirPath.split('/').filter(p => p).pop() || '';
          projects.push(projectSlug);
        }
      }

      return projects;
    } catch (error) {
      logger.error(`Failed to list projects:`, error);
      return [];
    }
  }

  async createProjectStructure(projectSlug: string): Promise<void> {
    const projectDir = this.getProjectDirectory(projectSlug);
    await this.ensureDirectoryExists(projectDir);
    await this.ensureDirectoryExists(this.getProjectBoardsDirectory(projectSlug));
    await this.ensureDirectoryExists(this.getProjectNotesDirectory(projectSlug, 'general'));
    await this.ensureDirectoryExists(this.getProjectNotesDirectory(projectSlug, 'meetings'));
    await this.ensureDirectoryExists(this.getProjectNotesDirectory(projectSlug, 'daily'));
    await this.ensureDirectoryExists(this.getProjectTimeDirectory(projectSlug));
  }

  async ensureDirectoryExists(path: string): Promise<void> {
    try {
      const info = await FileSystem.getInfoAsync(path);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(path, { intermediates: true });
      }
    } catch (error) {
      throw new Error(`Failed to create directory ${path}: ${error}`);
    }
  }

  async readFile(path: string): Promise<string> {
    try {
      const info = await FileSystem.getInfoAsync(path);
      if (!info.exists) {
        throw new Error(`File does not exist: ${path}`);
      }
      return await FileSystem.readAsStringAsync(path);
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error}`);
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    try {
      const parentDir = this.getParentDirectory(path);
      await this.ensureDirectoryExists(parentDir);
      await FileSystem.writeAsStringAsync(path, content);
    } catch (error) {
      throw new Error(`Failed to write file ${path}: ${error}`);
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        await FileSystem.deleteAsync(path, { idempotent: true });
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Failed to delete file ${path}:`, error);
      return false;
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(oldPath);
      if (!info.exists) {
        return false;
      }

      const newParentDir = this.getParentDirectory(newPath);
      await this.ensureDirectoryExists(newParentDir);

      await FileSystem.moveAsync({ from: oldPath, to: newPath });
      return true;
    } catch (error) {
      logger.error(`Failed to rename file ${oldPath} to ${newPath}:`, error);
      return false;
    }
  }

  async deleteDirectory(path: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        await FileSystem.deleteAsync(path, { idempotent: true });
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Failed to delete directory ${path}:`, error);
      return false;
    }
  }

  async listFiles(directory: string, pattern?: string): Promise<string[]> {
    try {
      const normalizedDir = directory.endsWith('/') ? directory : `${directory}/`;

      const info = await FileSystem.getInfoAsync(directory);
      if (!info.exists) {
        return [];
      }

      const items = await FileSystem.readDirectoryAsync(directory);
      const regexPattern = pattern ? this.globToRegex(pattern) : null;

      const filteredItems = items
        .filter(name => !name.startsWith('.'))
        .filter(name => !regexPattern || regexPattern.test(name));

      const fileChecks = await Promise.all(
        filteredItems.map(async (name) => {
          const fullPath = `${normalizedDir}${name}`;
          const itemInfo = await FileSystem.getInfoAsync(fullPath);

          if (itemInfo.exists && !itemInfo.isDirectory) {
            return fullPath;
          }

          return null;
        })
      );

      return fileChecks.filter((path): path is string => path !== null);
    } catch (error) {
      throw new Error(`Failed to list files in ${directory}: ${error}`);
    }
  }

  async listDirectories(directory: string): Promise<string[]> {
    try {
      const normalizedDir = directory.endsWith('/') ? directory : `${directory}/`;

      const info = await FileSystem.getInfoAsync(directory);
      if (!info.exists) {
        return [];
      }

      const items = await FileSystem.readDirectoryAsync(directory);

      const dirChecks = await Promise.all(
        items.map(async (name) => {
          const fullPath = `${normalizedDir}${name}`;
          const itemInfo = await FileSystem.getInfoAsync(fullPath);
          return itemInfo.exists && itemInfo.isDirectory ? `${fullPath}/` : null;
        })
      );

      return dirChecks.filter((path): path is string => path !== null);
    } catch (error) {
      throw new Error(`Failed to list directories in ${directory}: ${error}`);
    }
  }

  async fileExists(path: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(path);
      return info.exists && !info.isDirectory;
    } catch (error) {
      return false;
    }
  }

  async directoryExists(path: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(path);
      return info.exists && info.isDirectory === true;
    } catch (error) {
      return false;
    }
  }

  async isDirectoryWritable(path: string): Promise<boolean> {
    try {
      await this.ensureDirectoryExists(path);

      const testFileName = `.write-test-${Date.now()}`;
      const normalizedPath = path.endsWith('/') ? path : `${path}/`;
      const testFilePath = `${normalizedPath}${testFileName}`;
      await FileSystem.writeAsStringAsync(testFilePath, 'test');

      const info = await FileSystem.getInfoAsync(testFilePath);
      if (info.exists) {
        await FileSystem.deleteAsync(testFilePath, { idempotent: true });
      }

      return true;
    } catch (error) {
      logger.error(`Directory ${path} is not writable:`, error);
      return false;
    }
  }

  async listBoards(boardsDirectory: string): Promise<string[]> {
    try {
      const info = await FileSystem.getInfoAsync(boardsDirectory);
      if (!info.exists) {
        return [];
      }

      const subdirs = await this.listDirectories(boardsDirectory);
      const boards: string[] = [];

      for (const subdirPath of subdirs) {
        const kanbanFilePath = `${subdirPath}board.md`;
        const kanbanInfo = await FileSystem.getInfoAsync(kanbanFilePath);
        if (kanbanInfo.exists) {
          const boardName = subdirPath.split('/').filter(p => p).pop() || '';
          boards.push(boardName);
        }
      }

      return boards;
    } catch (error) {
      logger.error(`Failed to list boards in ${boardsDirectory}:`, error);
      return [];
    }
  }

  /**
   * Check if a directory has any boards
   */
  async hasBoards(boardsDirectory: string): Promise<boolean> {
    const boards = await this.listBoards(boardsDirectory);
    return boards.length > 0;
  }

  async copyFile(sourcePath: string, destPath: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(sourcePath);
      if (!info.exists) {
        logger.error(`Source file does not exist: ${sourcePath}`);
        return false;
      }

      const destParent = this.getParentDirectory(destPath);
      await this.ensureDirectoryExists(destParent);

      await FileSystem.copyAsync({ from: sourcePath, to: destPath });

      return true;
    } catch (error) {
      logger.error(`Failed to copy file from ${sourcePath} to ${destPath}:`, error);
      return false;
    }
  }

  async copyDirectory(
    sourcePath: string,
    destPath: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: boolean; copiedFiles: number; errors: string[] }> {
    const errors: string[] = [];
    let copiedFiles = 0;

    try {
      const info = await FileSystem.getInfoAsync(sourcePath);
      if (!info.exists) {
        errors.push(`Source directory does not exist: ${sourcePath}`);
        return { success: false, copiedFiles: 0, errors };
      }

      await this.ensureDirectoryExists(destPath);

      const normalizedSrc = sourcePath.endsWith('/') ? sourcePath : `${sourcePath}/`;
      const normalizedDest = destPath.endsWith('/') ? destPath : `${destPath}/`;
      const items = await FileSystem.readDirectoryAsync(sourcePath);
      const totalItems = items.length;

      for (let i = 0; i < items.length; i++) {
        const itemName = items[i];
        const srcItemPath = `${normalizedSrc}${itemName}`;
        const destItemPath = `${normalizedDest}${itemName}`;

        try {
          const itemInfo = await FileSystem.getInfoAsync(srcItemPath);
          if (!itemInfo.isDirectory) {
            const success = await this.copyFile(srcItemPath, destItemPath);
            if (success) {
              copiedFiles++;
            } else {
              errors.push(`Failed to copy file: ${srcItemPath}`);
            }
          } else {
            const subResult = await this.copyDirectory(
              `${srcItemPath}/`,
              `${destItemPath}/`,
              onProgress
            );
            copiedFiles += subResult.copiedFiles;
            errors.push(...subResult.errors);
          }
        } catch (error) {
          errors.push(`Error copying ${srcItemPath}: ${error}`);
        }

        if (onProgress) {
          onProgress(i + 1, totalItems);
        }
      }

      return {
        success: errors.length === 0,
        copiedFiles,
        errors
      };
    } catch (error) {
      errors.push(`Failed to copy directory: ${error}`);
      return { success: false, copiedFiles, errors };
    }
  }

  /**
   * Get parent directory path from a file path
   * Equivalent to Python's Path.parent
   */
  private getParentDirectory(path: string): string {
    const parts = path.split("/");
    parts.pop(); // Remove filename
    return parts.join("/") + "/";
  }

  /**
   * Convert a glob pattern to a regular expression
   * Supports basic glob patterns: *, ?, [abc]
   */
  private globToRegex(pattern: string): RegExp {
    // Escape special regex characters except glob wildcards
    let regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape special chars
      .replace(/\*/g, ".*") // * matches any characters
      .replace(/\?/g, "."); // ? matches single character

    return new RegExp(`^${regexPattern}$`);
  }

  async getFileInfo(path: string): Promise<FileSystem.FileInfo> {
    return await FileSystem.getInfoAsync(path);
  }

  /**
   * Get the base directory used by this manager
   */
  getBaseDirectory(): string {
    return this.baseDirectory;
  }

  /**
   * Register an observer to be notified when boards directory changes
   * @param observer The observer to register
   */
  addObserver(observer: FileSystemObserver): void {
    this.observers.add(observer);
  }

  /**
   * Unregister an observer
   * @param observer The observer to unregister
   */
  removeObserver(observer: FileSystemObserver): void {
    this.observers.delete(observer);
  }

  /**
   * Notify all observers that the boards directory has changed
   * @param newPath The new boards directory path
   */
  private notifyBoardsDirectoryChanged(newPath: string): void {
    this.observers.forEach(observer => {
      try {
        observer.onBoardsDirectoryChanged(newPath);
      } catch (error) {
        logger.error('Error notifying observer of boards directory change:', error);
      }
    });
  }
}

// Export a singleton instance for convenience
export const fileSystemManager = new FileSystemManager();
