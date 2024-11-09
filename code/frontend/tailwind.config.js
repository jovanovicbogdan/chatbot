/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,tsx}'],
  darkMode: 'selector',
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // Base colors
        charcoal: '#202023',
        bone: '#f0e7db',

        // Light theme colors
        primary: '#3d7aed', // Dodger Blue
        secondary: '#805ad5', // Medium Purple
        accent: '#ff63c3', // Hot Pink
        // background: '#f0e7db', // Bone
        background: '#ffffff',
        text: '#202023', // Charcoal Gray

        // Dark theme colors
        'dark-primary': '#81E6D9', // Turquoise
        'dark-secondary': '#319795', // Persian Green
        'dark-accent': '#fbd38d', // Peach
        'dark-background': '#202023', // Charcoal Gray
        'dark-text': '#F0E7DB', // Bone
        lightGray: '#ECECEC', // Light Gray
        lightSkyBlue: '#A8C7FA',

        salmonRed: '#FF6C6C',
        goldenYellow: '#FFBD45',
        upGreen: '#14a800',
        upGreenDarkest: '#2d6318',
        tealGreen: '#006D5B',
        // green: '#09AB3B',
        // lightGray: '#f3f4f6',
        darkGray: '#313134',
        // charcoal: '#2d3748',
      },
    },
  },
  plugins: [
    function ({ addBase, theme }) {
      addBase({
        ':root': {
          '--color-salmon-red': theme('colors.salmonRed'),
          '--color-golden-yellow': theme('colors.goldenYellow'),
          '--color-up-green': theme('colors.upGreen'),
          '--color-up-green-darkest': theme('colors.upGreenDarkest'),
          '--color-teal-green': theme('colors.tealGreen'),
          // '--color-green': theme('colors.green'),
          '--color-light-gray': theme('colors.lightGray'),
          '--color-dark-gray': theme('colors.darkGray'),
          '--color-charcoal': theme('colors.charcoal'),
          '--color-primary': theme('colors.primary'),
        },
      });
    },
  ],
};
