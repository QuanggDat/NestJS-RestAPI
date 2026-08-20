import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InsertNoteDTO, UpdateNoteDTO } from './dto';

@Injectable()
export class NoteService {
  constructor(private prismaService: PrismaService) {}

  //lấy TẤT CẢ note của riêng user đang đăng nhập
  getNotes(userId: number) {
    return this.prismaService.note.findMany({
      where: {
        userId: userId,
      },
    });
  }

  //lấy một note theo id, nhưng vẫn phải đúng chủ sở hữu
  async getNoteById(userId: number, noteId: number) {
    const note = await this.prismaService.note.findFirst({
      where: {
        id: noteId,
        userId: userId, //note của người khác thì coi như không tồn tại
      },
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  //tạo note mới, tự gắn userId của người đang đăng nhập
  insertNote(userId: number, insertNoteDTO: InsertNoteDTO) {
    return this.prismaService.note.create({
      data: {
        ...insertNoteDTO,
        userId: userId,
      },
    });
  }

  async updateNoteById(
    userId: number,
    noteId: number,
    updateNoteDTO: UpdateNoteDTO,
  ) {
    //kiểm tra quyền TRƯỚC khi sửa
    const note = await this.prismaService.note.findUnique({
      where: {
        id: noteId,
      },
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    if (note.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }
    return this.prismaService.note.update({
      where: {
        id: noteId,
      },
      data: {
        ...updateNoteDTO,
      },
    });
  }

  async deleteNoteById(userId: number, noteId: number) {
    //cũng phải kiểm tra quyền TRƯỚC khi xoá
    const note = await this.prismaService.note.findUnique({
      where: {
        id: noteId,
      },
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    if (note.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }
    await this.prismaService.note.delete({
      where: {
        id: noteId,
      },
    });
  }
}
