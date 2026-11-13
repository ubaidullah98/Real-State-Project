import { ExtractedPlotLayout, PlotCategory } from '../types';

export interface MasterPlanAnalysisResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  previewUrl: string;
  width: number;
  height: number;
  detectedBlocks: string[];
  extractedPlots: ExtractedPlotLayout[];
  scaleInfo: {
    pixelsPerMeter: number;
    totalAreaEstimate: string;
  };
}

/**
 * Simulates intelligent vector/raster extraction on uploaded Master Plan
 * and provides structured layout for 3D generation.
 */
export async function analyzeMasterPlanFile(
  file: File,
  blockPrefix: string = 'Block A',
  estimatedPlots: number = 24,
  plotSizeCategory: string = '120 Sq. Yds'
): Promise<MasterPlanAnalysisResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;

      // Extract image dimensions for scaling
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || 1200;
        const height = img.naturalHeight || 800;

        // Auto-generate realistic extracted plot geometry coordinates from canvas dimensions
        const extracted: ExtractedPlotLayout[] = [];
        const rows = Math.ceil(Math.sqrt(estimatedPlots * 0.7));
        const cols = Math.ceil(estimatedPlots / rows);

        let plotIndex = 1;
        const baseWidth = plotSizeCategory.includes('400') ? 22 : plotSizeCategory.includes('200') ? 17 : 13;
        const baseDepth = plotSizeCategory.includes('400') ? 24 : plotSizeCategory.includes('200') ? 18 : 14;
        const spacingX = baseWidth + 4;
        const spacingZ = baseDepth + 8;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (plotIndex > estimatedPlots) break;

            const isCorner = (r === 0 || r === rows - 1) && (c === 0 || c === cols - 1);
            const isParkFacing = r === 1;

            let category: PlotCategory = 'residential';
            if (isCorner) category = 'corner';
            else if (isParkFacing) category = 'park_facing';
            else if (c === 0) category = 'boulevard';

            const plotNum = `${blockPrefix.replace(/Block\s*/i, '').trim() || 'A'}-${String(plotIndex).padStart(2, '0')}`;

            // Centered coordinates for 3D world space
            const x = (c - cols / 2) * spacingX;
            const z = (r - rows / 2) * spacingZ;

            let dimensions = '30 x 36 ft';
            let price = 2160000;
            if (plotSizeCategory.includes('200')) {
              dimensions = '35 x 51 ft';
              price = 3500000;
            } else if (plotSizeCategory.includes('400') || plotSizeCategory.includes('Kanal')) {
              dimensions = '50 x 72 ft';
              price = 6800000;
            }

            extracted.push({
              plotNumber: plotNum,
              blockNumber: blockPrefix,
              x: Math.round(x),
              z: Math.round(z),
              width: baseWidth,
              depth: baseDepth,
              sizeStr: plotSizeCategory,
              dimensions,
              category,
              estimatedPrice: price,
            });

            plotIndex++;
          }
        }

        resolve({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/pdf',
          previewUrl: dataUrl,
          width,
          height,
          detectedBlocks: [blockPrefix, 'Block B', 'Sector Commercial'],
          extractedPlots: extracted,
          scaleInfo: {
            pixelsPerMeter: 12.5,
            totalAreaEstimate: '25 Acres (approx.)',
          },
        });
      };

      img.onerror = () => {
        // Fallback for non-image PDF rendering preview placeholder
        const extracted: ExtractedPlotLayout[] = [];
        for (let i = 1; i <= estimatedPlots; i++) {
          const col = (i - 1) % 6;
          const row = Math.floor((i - 1) / 6);
          extracted.push({
            plotNumber: `${blockPrefix.replace(/Block\s*/i, '').trim() || 'A'}-${String(i).padStart(2, '0')}`,
            blockNumber: blockPrefix,
            x: (col - 2.5) * 16,
            z: (row - 2) * 20,
            width: 14,
            depth: 16,
            sizeStr: plotSizeCategory,
            dimensions: '30 x 36 ft',
            category: i === 1 || i === 6 ? 'corner' : 'residential',
            estimatedPrice: 2160000,
          });
        }

        resolve({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/pdf',
          previewUrl: '',
          width: 1200,
          height: 800,
          detectedBlocks: [blockPrefix],
          extractedPlots: extracted,
          scaleInfo: {
            pixelsPerMeter: 10,
            totalAreaEstimate: '20 Acres (approx.)',
          },
        });
      };

      img.src = dataUrl;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
