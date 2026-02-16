import { MediaItem } from './types';

// App Logo - You can replace this URL with your uploaded icon URL
export const APP_LOGO = "https://cdn-icons-png.flaticon.com/512/2503/2503508.png"; // Placeholder high-quality play icon

// Using high quality placeholder images that resemble the aesthetic
export const MOCK_MEDIA: MediaItem[] = [
  {
    id: '1',
    title: 'Dune: Part Two',
    year: 2024,
    rating: 8.9,
    appRating: 4.8,
    duration: '2h 46m',
    type: 'movie',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    isTrending: true,
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', image: 'https://image.tmdb.org/t/p/w185/BE2sdjpgEHRr95l1NYNDZwvKXq.jpg' },
      { name: 'Zendaya', role: 'Chani', image: 'https://image.tmdb.org/t/p/w185/cbCib5216d73Xsl67LO1zzmAJsh.jpg' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica', image: 'https://image.tmdb.org/t/p/w185/lJloTOheuQSirSLXNA3JHsrMNfH.jpg' }
    ]
  },
  {
    id: '2',
    title: 'Oppenheimer',
    year: 2023,
    rating: 8.6,
    appRating: 4.7,
    duration: '3h 00m',
    type: 'movie',
    genre: ['Biography', 'Drama', 'History'],
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwvkhiUHYIf8.jpg',
    isTrending: true
  },
  {
    id: '3',
    title: 'The Last of Us',
    year: 2023,
    rating: 8.8,
    appRating: 4.9,
    duration: '1 Season',
    type: 'tv',
    genre: ['Drama', 'Horror', 'Action'],
    description: 'After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity\'s last hope.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyhoK9rqeF0.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/9yBVqNruk6Ykrwc32qrK2TIE5xw.jpg',
    isTrending: false
  }
];