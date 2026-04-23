/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'srf-white': '#ffffff',
        'srf-red': '#af001e',
        'srf-warm-gray': '#ebebe5',
        'srf-gray-scale': '#333333',
        'srf-blue': '#135c94',
        'srf-r': {
          50: '#ffe6e6',
          100: '#ffbbbc',
          200: '#ff9193',
          300: '#ff6669',
          400: '#f1434a',
          500: '#e31f2b',
          600: '#c91024',
          700: '#af001e',
          800: '#8d0614',
          900: '#6a0b0c',
        },
        'srf-gs': {
          10: '#fafafa',
          25: '#f5f5f5',
          50: '#e9e9e9',
          100: '#d9d9d9',
          200: '#cacaca',
          300: '#b9b9b9',
          400: '#acacac',
          500: '#9e9e9e',
          600: '#939393',
          700: '#878787',
          800: '#696969',
          900: '#333333',
          1000: '#000000',
        },
        'srf-wg': {
          10: '#fafaf8',
          25: '#f5f5f2',
          50: '#ebebe5',
          100: '#dadad2',
          200: '#cac8bf',
          300: '#b9b7ac',
          400: '#acaa9e',
          500: '#9f9c90',
          600: '#939184',
          700: '#888579',
          800: '#6b6960',
          850: '#5e5d56',
          900: '#4e4d47',
          950: '#45443d',
          1000: '#383732',
          1050: '#2e2d29',
          1100: '#22211d',
          1150: '#141411',
        },
        'srf-b': {
          50: '#e6f4ff',
          100: '#bbe1ff',
          200: '#91ceff',
          300: '#66bbff',
          400: '#42a3f1',
          500: '#1e8ce3',
          600: '#1a7ac5',
          650: '#1871b6',
          700: '#1667a7',
          750: '#135c94',
          800: '#105082',
          850: '#0d446f',
          900: '#0a385c',
          950: '#052d41',
        }
      },
    },
  },
  plugins: [],
}

/*



*/