import type { Config } from 'tailwindcss';

// OncoContigo — Paleta de marca
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EAF3FB',
          100: '#D5E6F5',
          200: '#B4D3EC',
          500: '#2B7DB8', // Azul confianza (principal)
          600: '#226394', // Azul oscuro (hover)
          700: '#1B4F76',
        },
        coral: {
          50: '#FDEFEA',
          100: '#FBDDD3',
          500: '#F2856B', // Coral cálido (acento humano)
          600: '#E06A4F', // Coral oscuro (hover)
        },
        sage: {
          50: '#EDF5F0',
          100: '#D8EADF',
          500: '#7BB89A', // Verde salvia (salud / ok)
          600: '#5E9C7D',
        },
        cream: '#FBF7F2', // Fondo cálido
        ink: '#2A3B4D', // Texto principal (azul-gris cálido)
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
