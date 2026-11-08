import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const genreNames = ["Fantasy", "Science Fiction", "Mystery", "Biography"];
  const genres = await Promise.all(
    genreNames.map((name) =>
      prisma.genre.create({
        data: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
      }),
    ),
  );

  const sampleBooks = [
    // Fantasy
    { title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy" },
    { title: "The Fellowship of the Ring", author: "J.R.R. Tolkien", genre: "Fantasy" },
    { title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy" },
    { title: "A Game of Thrones", author: "George R.R. Martin", genre: "Fantasy" },

    // Science Fiction
    { title: "Dune", author: "Frank Herbert", genre: "Science Fiction" },
    { title: "Neuromancer", author: "William Gibson", genre: "Science Fiction" },
    { title: "Foundation", author: "Isaac Asimov", genre: "Science Fiction" },
    { title: "Fahrenheit 451", author: "Ray Bradbury", genre: "Science Fiction" },

    // Mystery
    { title: "The Big Sleep", author: "Raymond Chandler", genre: "Mystery" },
    { title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", genre: "Mystery" },
    { title: "And Then There Were None", author: "Agatha Christie", genre: "Mystery" },
    { title: "Gone Girl", author: "Gillian Flynn", genre: "Mystery" },

    // Biography
    { title: "Educated", author: "Tara Westover", genre: "Biography" },
    { title: "Steve Jobs", author: "Walter Isaacson", genre: "Biography" },
    { title: "Becoming", author: "Michelle Obama", genre: "Biography" },
    { title: "The Diary of a Young Girl", author: "Anne Frank", genre: "Biography" },
  ];

  for (const book of sampleBooks) {
    const genre = genres.find((g) => g.name === book.genre);
    if (!genre) throw new Error(`Genre not found for ${book.title}`);
    await prisma.book.create({
      data: {
        title: book.title,
        author: book.author,
        isbn: `978${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        description: `${book.title} by ${book.author}.`,
        totalCopies: 3,
        availableCopies: 3,
        genreId: genre.id,
      },
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
