import { useState, useEffect, useMemo } from 'react';
import { NoteDetailDto, NoteType } from 'shared-types';

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  [NoteType.General]: 'Note',
  [NoteType.Meeting]: 'Meeting',
  [NoteType.Daily]: 'Daily',
  [NoteType.Task]: 'Task',
};

export const useNoteFilters = (notes: NoteDetailDto[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NoteType | 'all'>('all');
  const [filteredNotes, setFilteredNotes] = useState<NoteDetailDto[]>(notes);

  useEffect(() => {
    let filtered = notes;

    if (selectedType !== 'all') {
      filtered = filtered.filter((note) => (note.type ?? NoteType.General) === selectedType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    }

    setFilteredNotes(filtered);
  }, [notes, selectedType, searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
  };

  const hasActiveFilters = useMemo(
    () => searchQuery.trim() !== '' || selectedType !== 'all',
    [searchQuery, selectedType]
  );

  const noteCountLabel = useMemo(() => {
    const count = filteredNotes.length;
    const suffix = count === 1 ? 'note' : 'notes';
    if (selectedType === 'all') {
      return `${count} ${suffix}`;
    }
    return `${count} ${suffix} \u2022 ${NOTE_TYPE_LABELS[selectedType]}`;
  }, [filteredNotes.length, selectedType]);

  return {
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    filteredNotes,
    clearFilters,
    hasActiveFilters,
    noteCountLabel,
  };
};
