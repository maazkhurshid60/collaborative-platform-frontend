// src/types/svg.d.ts

declare module '*.svg' {
    const src: string;
    export default src;
}

declare module '*.svg?react' {
    import * as React from 'react';
    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}
