import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    const genre = await this.prisma.genre.findUnique({
      where: { id: createBookDto.genreId },
    });

    if (!genre) {
      throw new NotFoundException(`Genre with ID ${createBookDto.genreId} not found`);
    }

    const existing = await this.prisma.book.findUnique({
      where: { isbn: createBookDto.isbn },
    });

    if (existing) {
      throw new ConflictException('Book with this ISBN already exists');
    }

    const totalCopies = createBookDto.totalCopies ?? 1;

    return this.prisma.book.create({
      data: {
        title: createBookDto.title,
        author: createBookDto.author,
        isbn: createBookDto.isbn,
        description:
          createBookDto.description ??
          `${createBookDto.title} by ${createBookDto.author}.`,
        coverImage: createBookDto.coverImage,
        totalCopies,
        availableCopies: totalCopies,
        genreId: createBookDto.genreId,
      },
      include: {
        genre: true,
      },
    });
  }

  async findAll(query?: {
    genreId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.BookWhereInput = {};

    if (query?.genreId) {
      where.genreId = Number(query.genreId);
    }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { author: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query?.page ? Math.max(1, Number(query.page)) : 1;
    const limit = query?.limit ? Math.max(1, Number(query.limit)) : 10;
    const skip = (page - 1) * limit;
    const take = limit;

    return this.prisma.book.findMany({
      where,
      skip,
      take,
      include: {
        genre: true,
      },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        genre: true,
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    await this.findOne(id);

    if (updateBookDto.genreId) {
      const genre = await this.prisma.genre.findUnique({
        where: { id: updateBookDto.genreId },
      });
      if (!genre) {
        throw new NotFoundException(`Genre with ID ${updateBookDto.genreId} not found`);
      }
    }

    if (updateBookDto.isbn) {
      const existing = await this.prisma.book.findUnique({
        where: { isbn: updateBookDto.isbn },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Book with this ISBN already exists');
      }
    }

    return this.prisma.book.update({
      where: { id },
      data: updateBookDto,
      include: {
        genre: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({
      where: { id },
    });
  }
}
