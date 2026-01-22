import { Logger } from '@nestjs/common';
import { EntityType } from '../interfaces/entity-event.interface';
import { EntityEventEmitter } from './entity-event-emitter.service';

/**
 * Repository Event Wrapper using Proxy pattern
 * Transparently intercepts repository CRUD operations to emit entity change events
 * without modifying repository code
 */
export class RepositoryEventWrapper {
  private static readonly logger = new Logger(RepositoryEventWrapper.name);

  /**
   * Wrap a repository to emit events on create/update/delete operations
   * @param repository The repository instance to wrap
   * @param entityType The type of entity this repository manages
   * @param eventEmitter The event emitter to use for broadcasting events
   * @returns Proxied repository that emits events transparently
   */
  static wrap<R extends object>(
    repository: R,
    entityType: EntityType,
    eventEmitter: EntityEventEmitter,
  ): R {
    return new Proxy(repository, {
      get(target: any, prop: string) {
        const originalMethod = target[prop];

        // Only intercept methods (not properties)
        if (typeof originalMethod !== 'function') {
          return originalMethod;
        }

        // Intercept create, update, and delete methods
        if (prop === 'create') {
          return async function (...args: any[]) {
            const result = await originalMethod.apply(target, args);
            try {
              // Extract entity ID from result
              const entityId = result?.id;
              if (entityId) {
                const event = eventEmitter.createEvent(
                  entityType,
                  'added',
                  entityId,
                  result,
                );
                eventEmitter.emit(event);
              }
            } catch (error) {
              RepositoryEventWrapper.logger.error(
                `Failed to emit 'added' event for ${entityType}`,
                error,
              );
            }
            return result;
          };
        }

        if (prop === 'update') {
          return async function (...args: any[]) {
            const result = await originalMethod.apply(target, args);
            try {
              // Extract entity ID from result or first argument
              const entityId = result?.id || args[0];
              if (entityId) {
                const event = eventEmitter.createEvent(
                  entityType,
                  'modified',
                  entityId,
                  result,
                );
                eventEmitter.emit(event);
              }
            } catch (error) {
              RepositoryEventWrapper.logger.error(
                `Failed to emit 'modified' event for ${entityType}`,
                error,
              );
            }
            return result;
          };
        }

        if (prop === 'delete') {
          return async function (...args: any[]) {
            // Extract entity ID from first argument (delete(id))
            const entityId = args[0];
            const result = await originalMethod.apply(target, args);
            try {
              if (entityId) {
                const event = eventEmitter.createEvent(
                  entityType,
                  'deleted',
                  entityId,
                );
                eventEmitter.emit(event);
              }
            } catch (error) {
              RepositoryEventWrapper.logger.error(
                `Failed to emit 'deleted' event for ${entityType}`,
                error,
              );
            }
            return result;
          };
        }

        // For all other methods, return as-is
        return originalMethod;
      },
    });
  }
}
