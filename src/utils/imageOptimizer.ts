/**
 * Utilitário de Otimização de Imagens no Client-Side via HTML5 Canvas.
 * Redimensiona para no máximo 1000px (mantendo proporção) e comprime para WebP (qualidade 0.8).
 * Essencial para velocidade em conexões 4G/Wi-Fi de bar/cozinha e economia no Storage.
 */

export interface OptimizedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  originalSizeBytes: number;
  compressedSizeBytes: number;
}

export async function resizeAndCompressImage(
  file: File,
  maxDimension = 1000,
  quality = 0.8
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Erro ao ler arquivo de imagem.'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Erro ao processar imagem para o canvas.'));

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calcular novas dimensões mantendo proporção com teto em maxDimension (1000px)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Contexto 2D do Canvas não disponível.'));
        }

        // Configuração de interpolação bicúbica de alta qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Desenhar a imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar para WebP com fallback seguro
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Falha ao gerar Blob WebP da imagem.'));
            }

            const dataUrl = canvas.toDataURL('image/webp', quality);

            resolve({
              blob,
              dataUrl,
              width,
              height,
              originalSizeBytes: file.size,
              compressedSizeBytes: blob.size,
            });
          },
          'image/webp',
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
