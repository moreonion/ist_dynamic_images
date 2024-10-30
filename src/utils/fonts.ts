import path from "node:path";

export const fonts = {
    'crimson-text': {
        normal: '/fonts/crimson-text/crimson-text-latin-400-normal.ttf'
    },
    'ibm-plex-sans': {
        normal: '/fonts/ibm-plex-sans/ibm-plex-sans-latin-400-normal.ttf'
    },
    'inter': {
        normal: '/fonts/inter/inter-latin-400-normal.ttf'
    },
    'lora': {
        normal: '/fonts/lora/lora-latin-400-normal.ttf'
    },
    'merriweather': {
        normal: '/fonts/merriweather/merriweather-latin-400-normal.ttf'
    },
    'nunito-sans': {
        normal: '/fonts/nunito-sans/nunito-sans-latin-400-normal.ttf'
    },
    'open-sans': {
        normal: '/fonts/open-sans/open-sans-latin-400-normal.ttf'
    },
    'pt-serif': {
        normal: '/fonts/pt-serif/pt-serif-latin-400-normal.ttf'
    },
    'roboto': {
        normal: '/fonts/roboto/roboto-latin-400-normal.ttf'
    },
    'source-sans-pro': {
        normal: '/fonts/source-sans-pro/source-sans-pro-latin-400-normal.ttf'
    },
    'source-serif-pro': {
        normal: '/fonts/source-serif-pro/source-serif-pro-latin-400-normal.ttf'
    },
    'work-sans': {
        normal: '/fonts/work-sans/work-sans-latin-400-normal.ttf'
    }
} as const;

type FontFamily = keyof typeof fonts;
type FontStyle = keyof (typeof fonts)[FontFamily];

export const fontWeights = {
    normal: 400
} as const;

type FontFile = string;
type FontCombination = {
    family: FontFamily;
    style: FontStyle;
    file: FontFile;
};

// Get list of all available font families
export const getAllAvailableFontFamilies = () => {
    return Object.keys(fonts) as [FontFamily, ...FontFamily[]];
};

// Get all available font combinations, eg ['inter', 'normal', 'fonts/inter/inter-latin-400-normal.ttf']
export const getAllFontCombinations = (): FontCombination[] => {
    const combinations: FontCombination[] = [];
    Object.keys(fonts).forEach((family) => {
        Object.keys(fonts[family as FontFamily]).forEach((style) => {
            combinations.push({
                family: family as FontFamily,
                style: style as FontStyle,
                file: fonts[family as FontFamily][style as FontStyle]
            });
        });
    });
    return combinations;
};

// Get all currently available styles across all fonts, eg ['normal']
export const getAllAvailableStyles = () => {
    const styles = new Set<FontStyle>();
    Object.values(fonts).forEach(FontStyles => {
        Object.keys(FontStyles).forEach(style => styles.add(style as FontStyle));
    });
    return Array.from(styles) as [FontStyle, ...FontStyle[]];
};

// Get available styles for a font family, eg ['normal']
export const getAvailableStyles = (family: FontFamily): FontStyle[] => {
    return Object.keys(fonts[family]) as FontStyle[];
};

// Helper function to get font path in different environments
export const getFontPath = (relativeFontPath: string) => {
    // Remove leading slash
    const cleanPath = relativeFontPath.replace(/^\//, '');

    if (process.env.NETLIFY) {
        // In Netlify function environment, fonts will be relative to function
        return path.join('public', cleanPath);
    } else {
        // In local development, use project root
        return path.join(process.cwd(), 'public', cleanPath);
    }
};