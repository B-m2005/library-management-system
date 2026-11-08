import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/mydb';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Insert at least 4 Genre rows
  const fiction = await prisma.genre.upsert({
    where: { name: 'Fiction' },
    update: {},
    create: { name: 'Fiction' },
  });

  const sciFi = await prisma.genre.upsert({
    where: { name: 'Science Fiction' },
    update: {},
    create: { name: 'Science Fiction' },
  });

  const mystery = await prisma.genre.upsert({
    where: { name: 'Mystery' },
    update: {},
    create: { name: 'Mystery' },
  });

  const nonFiction = await prisma.genre.upsert({
    where: { name: 'Non-Fiction' },
    update: {},
    create: { name: 'Non-Fiction' },
  });

  // Insert at least 15 Book rows distributed across those genres (16 total, 4 per genre)
  const books = [
    // Fiction (4)
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '9780743273565',
      genreId: fiction.id,
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '9780061120084',
      genreId: fiction.id,
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      isbn: '9780141439518',
      genreId: fiction.id,
    },
    {
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      isbn: '9780316769488',
      genreId: fiction.id,
    },

    // Science Fiction (4)
    {
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '9780441013593',
      genreId: sciFi.id,
    },
    {
      title: 'Neuromancer',
      author: 'William Gibson',
      isbn: '9780441569595',
      genreId: sciFi.id,
    },
    {
      title: 'Foundation',
      author: 'Isaac Asimov',
      isbn: '9780553293357',
      genreId: sciFi.id,
    },
    {
      title: 'Fahrenheit 451',
      author: 'Ray Bradbury',
      isbn: '9781451673319',
      genreId: sciFi.id,
    },

    // Mystery (4)
    {
      title: 'The Hound of the Baskervilles',
      author: 'Arthur Conan Doyle',
      isbn: '9780140437867',
      genreId: mystery.id,
    },
    {
      title: 'And Then There Were None',
      author: 'Agatha Christie',
      isbn: '9780062073488',
      genreId: mystery.id,
    },
    {
      title: 'The Girl with the Dragon Tattoo',
      author: 'Stieg Larsson',
      isbn: '9780307949486',
      genreId: mystery.id,
    },
    {
      title: 'Gone Girl',
      author: 'Gillian Flynn',
      isbn: '9780307588371',
      genreId: mystery.id,
    },

    // Non-Fiction (4)
    {
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      isbn: '9780062316097',
      genreId: nonFiction.id,
    },
    {
      title: 'Educated',
      author: 'Tara Westover',
      isbn: '9780399590504',
      genreId: nonFiction.id,
    },
    {
      title: 'Becoming',
      author: 'Michelle Obama',
      isbn: '9781524763138',
      genreId: nonFiction.id,
    },
    {
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      isbn: '9780374533557',
      genreId: nonFiction.id,
    },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: book,
    });
  }

  console.log(`Seeding finished. Inserted 4 genres and ${books.length} books.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

