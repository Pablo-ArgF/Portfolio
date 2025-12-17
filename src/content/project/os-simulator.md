---
titulo: "Operating System Kernel Simulator"
fechaInicio: "2022-01"
fechaFin: "2022-05"
skills: ["C", "System Programming", "Memory Management", "Process Scheduling", "Interrupt Handling", "Concurrency"]
imagen: "/projects/os-simulator.jpg"
descripcion: "A low-level simulation of an Operating System kernel engineered in C. It orchestrates process lifecycles, memory partitioning, and interrupt vectors, demonstrating a profound understanding of underlying system architectures."
---

This project constitutes a deep exploration into the heart of computing: the **Operating System Kernel**. Programmed entirely in **C**, this simulation replicates the intricate behavior of a real-time OS, managing hardware resources and process execution with granular control.

The system was architected through several iterative versions, each introducing complex kernel subsystems:

*   **Process Management**: Implementation of a comprehensive **Process Control Block (PCB)** structure to manage process states (Ready, Running, Blocked, Sleeping) and transitions. Includes a dual-layer scheduling system with both **Long-Term** and **Short-Term Schedulers**.
*   **Memory Management**: A robust **Fixed Partition** memory allocator utilizing **Best-Fit algorithms** to optimize resource utilization and handle fragmentation.
*   **Interrupt Handling**: A sophisticated interrupt vector table managing **System Calls**, **Clock Interrupts**, and **Exceptions**, ensuring preemptive multitasking and system stability.
*   **Context Switching**: Low-level handling of register states (Accumulator, PC, PSW) to facilitate seamless switching between **User** and **Daemon** modes, enforcing privilege levels and memory protection.

This simulator stands as a demonstration of systems engineering proficiency, seamlessly uniting high-level software with the bare-metal hardware beneath it.
