import { Window } from "@/desktop";
import { ButtonWidget } from "@/desktop/widgets/button";
import { CheckboxWidget } from "@/desktop/widgets/checkbox";
import { Layout, LayoutOrientation } from "@/desktop/widgets/layout";
import { TextWidget } from "@/desktop/widgets/text";
import { TextInputWidget } from "@/desktop/widgets/text-input";
import { Kernel } from "@/kernel";

export class DummyApp {
  private kernel: Kernel;
  private window: Window;
  private mainLayout: Layout;

  constructor(kernel: Kernel, x: number = 50, y: number = 50) {
    const [_, window] = kernel
      .getWindowManager()
      .createWindow("Dummy", x, y, 500, 400);

    this.kernel = kernel;
    this.window = window;
    this.mainLayout = new Layout(LayoutOrientation.VERTICAL);
    this.window.setContentWidget(this.mainLayout);

    const text = new TextWidget(this.kernel.getVGA());
    text.setText("Hello, world!");
    this.mainLayout.addWidget(text);

    const button = new ButtonWidget(this.kernel.getVGA(), "Button", () => {});
    this.mainLayout.addWidget(button);

    const input = new TextInputWidget(this.kernel.getVGA(), "Input", () => {});
    this.mainLayout.addWidget(input);

    const checkbox = new CheckboxWidget(
      this.kernel.getVGA(),
      "Checkbox",
      () => {}
    );
    this.mainLayout.addWidget(checkbox);
  }
}
