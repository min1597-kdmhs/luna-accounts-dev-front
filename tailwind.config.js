/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    screens: {
      '2xs': { max: '319px' },
      'xs': { min: '320px' },
      'sm': { min: '476px' },
      'md': { min: '768px' },
      'lg': { min: '1024px' },
      'xl': { min: '1280px' },
      '2xl': { min: '1536px' },

      'min-2xs': { min: '0px' },
      'min-xs': { min: '320px' },
      'min-sm': { min: '476px' },
      'min-md': { min: '768px' },
      'min-lg': { min: '1024px' },
      'min-xl': { min: '1280px' },
      'min-2xl': { min: '1536px' },

      'max-2xs': { max: '319px' },
      'max-xs': { max: '475px' },
      'max-sm': { max: '767px' },
      'max-md': { max: '1023px' },
      'max-lg': { max: '1279px' },
      'max-xl': { max: '1535px' },
    },
    fontSize: {
      '4xs': [ '6px', '6px' ],
      '3xs': [ '8px', '8px' ],
      '2xs': [ '10px', '12px' ],
      'xs': [ '12px', '16px' ],
      'sm': [ '14px', '20px' ],
      'md': [ '16px', '24px' ],
      'lg': [ '20px', '28px' ],
      'xl': [ '24px', '32px' ],
      '2xl': [ '24px', '32px' ],
      '3xl': [ '30px', '36px' ],
      '4xl': [ '36px', '40px' ]
    },
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
        '15': 'repeat(15, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))'
      }
    },
  },
  plugins: [],
}