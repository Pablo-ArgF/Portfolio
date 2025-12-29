---
titulo: "Deepfake Detection Final Degree Project"
fechaInicio: "2023-10"
fechaFin: "2024-06"
skills: ["TensorFlow", "Python", "React", "Flask", "Docker", "Pandas", "Nginx"]
githubUrl: "https://github.com/Pablo-ArgF/Deepfake_Detector"
imagen: "/projects/deepfake.jpg"
descripcion: "A sophisticated forensic framework for detecting synthetic media, leveraging hybrid CNN-RNN architectures to provide granular, frame-by-frame explainability and temporal analysis."
---

Developed as a comprehensive **Bachelor's Thesis**, this project addresses the critical challenge of digital media authenticity through advanced **Deep Learning** techniques. The core innovation lies in a hybrid architecture combining **Convolutional Neural Networks (CNNs)** for spatial feature extraction and **Recurrent Neural Networks (RNNs)** for temporal sequence analysis, enabling the detection of deepfakes with high precision.

Beyond mere detection, the platform focuses on **Explainable AI (XAI)** to dismantle the "black box" paradigm. I engineered a full-stack solution featuring a **Flask** backend and a **React** frontend that empowers users to audit video content on a granular level. Key capabilities include:

- **Frame-by-Frame Analysis**: Detailed temporal graphs plotting "deepfake probability" across the video timeline, ensuring that even partial manipulations (e.g., a few seconds of fake content in a real video) are isolated and identified.
- **Visual Evidence**: Dynamic extraction and display of cropped facial regions used for inference, allowing for human-in-the-loop verification.
- **Statistical Rigor**: Comprehensive reporting of aggregated metrics like mean confidence, sequence coverage, and frame distribution.

The system was rigorously trained on refined datasets with custom **entropy augmentation** pipelines to booster resilience against compression artifacts. Deployments were orchestrated using **Docker** and **Nginx** reverse proxies to ensure a scalable, production-ready inference environment.

For a comprehensive understanding of the research methodology, architectural patterns, and validation results, the complete **Bachelor's Thesis (TFG)** is available for consultation at the [<u>University of Oviedo Repository</u>](https://hdl.handle.net/10651/74464).
