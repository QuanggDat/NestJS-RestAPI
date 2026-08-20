import { Module } from '@nestjs/common';
import { NoteController } from './note.controller';

@Module({
  controllers: [NoteController]
})
export class NoteModule {}
