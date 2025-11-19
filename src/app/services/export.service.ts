import { Injectable, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { CategorySchema, DynamicItem } from '../models/category-schema.model';
import { CardExportRendererComponent } from '../card-export-renderer/card-export-renderer.component';

export type ExportFormat = 'json' | 'csv' | 'markdown' | 'images';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(private appRef: ApplicationRef, private injector: EnvironmentInjector) {}
  /**
   * Export items to JSON format with optional schema
   */
  exportToJSON(items: any[], filename: string, schema?: CategorySchema): void {
    const exportData = schema
      ? {
          schema: {
            name: schema.name,
            icon: schema.icon,
            fields: schema.fields,
            cardLayout: schema.cardLayout,
          },
          items: items,
        }
      : items;

    const jsonStr = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonStr, `${filename}.json`, 'application/json');
  }

  /**
   * Export items to CSV format
   */
  exportToCSV(items: any[], filename: string): void {
    if (items.length === 0) {
      alert('No items to export');
      return;
    }

    // Get all unique keys from all items
    const keys = Array.from(new Set(items.flatMap((item) => Object.keys(item))));

    // Create CSV header
    const header = keys.join(',');

    // Create CSV rows
    const rows = items.map((item) => {
      return keys
        .map((key) => {
          const value = item[key];
          // Handle values that contain commas or quotes
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',');
    });

    const csv = [header, ...rows].join('\n');
    this.downloadFile(csv, `${filename}.csv`, 'text/csv');
  }

  /**
   * Export items to Markdown format
   */
  exportToMarkdown(items: any[], filename: string, categoryName: string): void {
    if (items.length === 0) {
      alert('No items to export');
      return;
    }

    let markdown = `# ${categoryName}\n\n`;
    markdown += `Total items: ${items.length}\n\n`;
    markdown += '---\n\n';

    items.forEach((item, index) => {
      markdown += `## ${index + 1}. ${item.name || item.id || 'Item'}\n\n`;

      Object.entries(item).forEach(([key, value]) => {
        if (key !== 'id') {
          markdown += `**${key}**: ${value}\n\n`;
        }
      });

      markdown += '---\n\n';
    });

    this.downloadFile(markdown, `${filename}.md`, 'text/markdown');
  }

  /**
   * Export cards as images in 3x3 grids using custom card layouts
   */
  async exportAsImages(
    items: DynamicItem[],
    schema: CategorySchema,
    categoryName: string,
    testMode = false
  ): Promise<void> {
    if (items.length === 0) {
      alert('No items to export');
      return;
    }

    if (!schema.cardLayout) {
      alert('No card layout found. Please design a card layout first.');
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      const cardsPerGrid = 9;
      const totalGrids = Math.ceil(items.length / cardsPerGrid);
      const cardWidth = schema.cardLayout.canvas.width;
      const cardHeight = schema.cardLayout.canvas.height;

      for (let gridIndex = 0; gridIndex < totalGrids; gridIndex++) {
        const startIdx = gridIndex * cardsPerGrid;
        const endIdx = Math.min(startIdx + cardsPerGrid, items.length);
        const gridItems = items.slice(startIdx, endIdx);

        // Create grid container
        const gridContainer = document.createElement('div');
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        gridContainer.style.gap = '20px';
        gridContainer.style.padding = '20px';
        gridContainer.style.backgroundColor = '#ffffff';
        gridContainer.style.position = 'absolute';
        gridContainer.style.left = '-9999px';
        gridContainer.style.top = '0';

        // Create card components for each item
        const componentRefs = gridItems.map((item) => {
          const componentRef = createComponent(CardExportRendererComponent, {
            environmentInjector: this.injector,
          });

          // Set inputs
          componentRef.setInput('item', item);
          componentRef.setInput('schema', schema);
          componentRef.setInput('layout', schema.cardLayout);
          componentRef.setInput('cardWidth', cardWidth);
          componentRef.setInput('cardHeight', cardHeight);

          // Attach to app
          this.appRef.attachView(componentRef.hostView);
          const domElem = componentRef.location.nativeElement as HTMLElement;
          gridContainer.appendChild(domElem);

          return componentRef;
        });

        document.body.appendChild(gridContainer);
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Capture grid
        const canvas = await html2canvas(gridContainer, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
        });

        // Cleanup
        componentRefs.forEach((ref) => {
          this.appRef.detachView(ref.hostView);
          ref.destroy();
        });
        document.body.removeChild(gridContainer);

        // TEST MODE: Show preview on page
        if (testMode && gridIndex === 0) {
          const dataUrl = canvas.toDataURL('image/png');
          this.showPreviewModal(dataUrl, categoryName);
          return; // Exit after first grid in test mode
        }

        // Download
        await new Promise<void>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              const filename = `${categoryName}-grid-${gridIndex + 1}.png`;
              link.href = url;
              link.download = filename;
              link.click();
              window.URL.revokeObjectURL(url);
            }
            resolve();
          });
        });

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      alert(`Exported ${totalGrids} grid${totalGrids > 1 ? 's' : ''} with ${items.length} cards`);
    } catch (error) {
      console.error('Error exporting images:', error);
      alert('Failed to export images: ' + (error as Error).message);
    }
  }

  /**
   * Show preview modal with exported image
   */
  private showPreviewModal(dataUrl: string, categoryName: string): void {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '2rem';

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '1rem';
    closeBtn.style.right = '1rem';
    closeBtn.style.padding = '0.75rem 1.5rem';
    closeBtn.style.fontSize = '1rem';
    closeBtn.style.backgroundColor = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    closeBtn.onclick = () => document.body.removeChild(modal);

    // Create image
    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.objectFit = 'contain';
    img.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';

    // Create title
    const title = document.createElement('div');
    title.textContent = `${categoryName} - Export Preview`;
    title.style.position = 'absolute';
    title.style.top = '1rem';
    title.style.left = '1rem';
    title.style.color = '#fff';
    title.style.fontSize = '1.25rem';
    title.style.fontWeight = 'bold';

    modal.appendChild(title);
    modal.appendChild(closeBtn);
    modal.appendChild(img);
    document.body.appendChild(modal);

    // Close on click outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  /**
   * Helper method to trigger file download
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
