class MeshLineMaterial extends THREE.ShaderMaterial {
    constructor(parameters: {
        vertexShader: string;
        fragmentShader: string;
        customUniforms: Record<string, any>;
        lineWidth: number;
        map: THREE.Texture;
        useMap: boolean;
        color: string;
        opacity: number;
        sizeAttenuation: boolean;
    }) { }
}

declare interface Window {
    MeshLineMaterial: MeshLineMaterial
}