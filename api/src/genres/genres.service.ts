import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGenreDto } from './dto/create-genre.dto.js';
import { UpdateGenreDto } from './dto/update-genre.dto.js';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGenreDto: CreateGenreDto) {
    const slug =
      createGenreDto.slug ??
      createGenreDto.name.toLowerCase().replace(/\s+/g, '-');

    const existing = await this.prisma.genre.findFirst({
      where: {
        OR: [{ name: createGenreDto.name }, { slug }],
      },
    });

    if (existing) {
      throw new ConflictException('Genre with this name or slug already exists');
    }

    return this.prisma.genre.create({
      data: {
        name: createGenreDto.name,
        slug,
      },
    });
  }

  async findAll() {
    return this.prisma.genre.findMany({
      include: {
        books: true,
      },
    });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });

    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }

    return genre;
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    await this.findOne(id);

    const data: { name?: string; slug?: string } = {};
    if (updateGenreDto.name !== undefined) data.name = updateGenreDto.name;
    if (updateGenreDto.slug !== undefined) data.slug = updateGenreDto.slug;
    if (updateGenreDto.name && !updateGenreDto.slug) {
      data.slug = updateGenreDto.name.toLowerCase().replace(/\s+/g, '-');
    }

    if (data.name || data.slug) {
      const existing = await this.prisma.genre.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(data.name ? [{ name: data.name }] : []),
                ...(data.slug ? [{ slug: data.slug }] : []),
              ],
            },
          ],
        },
      });

      if (existing) {
        throw new ConflictException('Another genre with this name or slug already exists');
      }
    }

    return this.prisma.genre.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.genre.delete({
      where: { id },
    });
  }
}
