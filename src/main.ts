import { MessageBox } from "@/desktop";
import { Kernel } from "@/kernel";

// Declare globals for use in the sandbox
declare global {
  interface Window {
    kernel: Kernel;
    messageBox: MessageBox;
  }
}

// Initialize the OS
function initOS() {
  // Create kernel
  const kernel = new Kernel();

  // Create message box
  const messageBox = new MessageBox(kernel.getVGA(), kernel.getMouse());

  // Expose to global scope for debugging
  window.kernel = kernel;
  window.messageBox = messageBox;

  // Execute shell on start
  kernel.executeShell();
}

// Start the OS when the page loads
window.addEventListener("load", initOS);
