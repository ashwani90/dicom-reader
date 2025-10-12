import React, { useEffect } from 'react';
import cornerstone from 'cornerstone-core';
import dicomParser from 'dicom-parser';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';

const DicomModal = ({ previewData }) => {
  useEffect(() => {
    if (!previewData) return;

    const element = document.getElementById('dicomViewer');
    cornerstone.enable(element);

    // previewData.url should be the path to the DICOM file
    fetch(previewData.url)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => {
        const byteArray = new Uint8Array(arrayBuffer);

        // You can load the DICOM as a blob for cornerstone
        const blob = new Blob([byteArray], { type: 'application/dicom' });
        let imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(blob.name, blob);
        // Tell WADO loader about cornerstone and dicomParser
        cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
        cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

        // Register the loader
        cornerstone.registerImageLoader(
        "wadouri",
        cornerstoneWADOImageLoader.wadouri.loadImage
        );

        // Configure web worker (optional but recommended)
        cornerstoneWADOImageLoader.webWorkerManager.initialize({
            maxWebWorkers: navigator.hardwareConcurrency || 1,
            startWebWorkersOnDemand: true,
            taskConfiguration: {
                decodeTask: {
                codecsPath: "cornerstoneWADOImageLoaderCodecs.js" // ensure file is in public/ folder
                }
            }
            });
        imageId = `wadouri:${previewData.url}`;
        cornerstone.loadImage(imageId).then((image) => {
          cornerstone.displayImage(element, image);
        });
      })
      .catch((err) => console.error('Error loading DICOM:', err));

    return () => {
      cornerstone.disable(element);
    };
  }, [previewData]);

  return null; // modal JSX stays outside
};

export default DicomModal;
