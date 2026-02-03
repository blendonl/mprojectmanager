import { Module } from '@nestjs/common';
import { NotesController } from './controller/notes.controller';
import { NotesCoreModule } from 'src/core/notes/notes.core.module';

@Module({
  imports: [NotesCoreModule],
  controllers: [NotesController],
})
export class NotesRestModule {}
