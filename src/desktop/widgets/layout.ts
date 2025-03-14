import { Widget, WidgetEvent } from "./widget";

export enum LayoutOrientation {
  HORIZONTAL,
  VERTICAL,
}

export interface LayoutItem {
  widget: Widget;
  flex: number;
}

export class Layout implements Widget {
  private orientation: LayoutOrientation;
  private items: LayoutItem[] = [];
  private padding: number = 0;

  constructor(orientation: LayoutOrientation = LayoutOrientation.VERTICAL) {
    this.orientation = orientation;
  }

  addWidget(widget: Widget, flex: number = 1): void {
    this.items.push({ widget, flex });
  }

  removeWidget(widget: Widget): void {
    const index = this.items.findIndex((item) => item.widget === widget);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  setPadding(padding: number): void {
    this.padding = padding;
  }

  draw(x: number, y: number, width: number, height: number): void {
    if (this.items.length === 0) return;

    // Calculate total flex
    const totalFlex = this.items.reduce((sum, item) => sum + item.flex, 0);

    // Calculate available space
    const totalPadding = this.padding * (this.items.length - 1);
    const availableSpace =
      (this.orientation === LayoutOrientation.HORIZONTAL ? width : height) -
      totalPadding;

    let currentPosition = 0;

    // Draw each item
    this.items.forEach((item) => {
      const itemSize = (availableSpace * item.flex) / totalFlex;

      if (this.orientation === LayoutOrientation.HORIZONTAL) {
        const itemX = x + currentPosition;
        const itemWidth = Math.floor(itemSize);
        item.widget.draw(itemX, y, itemWidth, height);
        currentPosition += itemWidth + this.padding;
      } else {
        const itemY = y + currentPosition;
        const itemHeight = Math.floor(itemSize);
        item.widget.draw(x, itemY, width, itemHeight);
        currentPosition += itemHeight + this.padding;
      }
    });
  }

  handleEvent(event: WidgetEvent): boolean {
    // Convert global coordinates to local widget coordinates
    for (const item of this.items) {
      // In a real implementation, you'd need to calculate the exact position and size of each widget
      // For simplicity, we're just forwarding the event to all widgets
      if (item.widget.handleEvent(event)) {
        return true;
      }
    }
    return false;
  }

  getMinWidth(): number {
    if (this.orientation === LayoutOrientation.HORIZONTAL) {
      return (
        this.items.reduce(
          (sum, item) => sum + item.widget.getMinWidth() + this.padding,
          0
        ) - (this.items.length > 0 ? this.padding : 0)
      );
    } else {
      return this.items.reduce(
        (max, item) => Math.max(max, item.widget.getMinWidth()),
        0
      );
    }
  }

  getMinHeight(): number {
    if (this.orientation === LayoutOrientation.VERTICAL) {
      return (
        this.items.reduce(
          (sum, item) => sum + item.widget.getMinHeight() + this.padding,
          0
        ) - (this.items.length > 0 ? this.padding : 0)
      );
    } else {
      return this.items.reduce(
        (max, item) => Math.max(max, item.widget.getMinHeight()),
        0
      );
    }
  }

  getPreferredWidth(): number {
    if (this.orientation === LayoutOrientation.HORIZONTAL) {
      return (
        this.items.reduce(
          (sum, item) => sum + item.widget.getPreferredWidth() + this.padding,
          0
        ) - (this.items.length > 0 ? this.padding : 0)
      );
    } else {
      return this.items.reduce(
        (max, item) => Math.max(max, item.widget.getPreferredWidth()),
        0
      );
    }
  }

  getPreferredHeight(): number {
    if (this.orientation === LayoutOrientation.VERTICAL) {
      return (
        this.items.reduce(
          (sum, item) => sum + item.widget.getPreferredHeight() + this.padding,
          0
        ) - (this.items.length > 0 ? this.padding : 0)
      );
    } else {
      return this.items.reduce(
        (max, item) => Math.max(max, item.widget.getPreferredHeight()),
        0
      );
    }
  }
}
