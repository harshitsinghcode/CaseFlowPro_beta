import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from "next-themes";
import { AiOutlineGoogle } from 'react-icons/ai';
import { FaReact } from 'react-icons/fa';
import { SiPostgresql, SiTailwindcss, SiSupabase } from "react-icons/si";
import { TbBrandNextjs } from 'react-icons/tb';

export default function TechStackComponent(): JSX.Element {
  const { theme, setTheme } = useTheme();
  const [background, setBackground] = useState("");
  const iframeRef = useRef(null);

  useEffect(() => {
    if (theme === "light") {
      setBackground("bg-zinc-950 text-white");
    } else if (theme === "dark" || theme === "system") {
      setBackground("bg-zinc-950 text-white");
    }
  }, [theme]);

  useEffect(() => {
    if (iframeRef.current) {
      // Add an event listener to capture XAPI statements
      iframeRef.current.contentWindow.addEventListener('message', (event) => {
        if (event.origin !== 'https://h5p.ipropel.co.in') {
          console.warn("Message received from unknown origin:", event.origin);
          return;
        }

        try {
          const xapiStatement = JSON.parse(event.data);
          console.log('xAPI Statement:', xapiStatement);

          // Log the intercepted data
          console.log('Intercepted data:', xapiStatement);

          // Send the intercepted data to the middleware
          sendDataToMiddleware(xapiStatement);
        } catch (error) {
          console.error('Error parsing xAPI statement:', error);
        }
      });

      // Check if H5P externalDispatcher exists (optional, for more control)
      const h5pWindow = iframeRef.current.contentWindow;
      if (h5pWindow.H5P && h5pWindow.H5P.externalDispatcher) {
        h5pWindow.H5P.externalDispatcher.on('xAPI', (event) => {
          // Handle XAPI events from H5P externalDispatcher
          console.log('H5P externalDispatcher xAPI event:', event);
        });
      } else {
        console.warn('H5P externalDispatcher not found in iframe');
      }
    }
  }, []);

  // Function to send intercepted data to the middleware
  const sendDataToMiddleware = (data) => {
    // Modify the data if needed (e.g., add additional fields)
    const modifiedData = { ...data, additionalField: 'value' };
    console.log('sending data to middleware:', modifiedData);

    // Send the data to the middleware using fetch
    fetch('http://localhost:6700/api/processData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modifiedData),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to send data to middleware: ${response.statusText}`);
      }
      console.log('Data sent to middleware successfully');
    })
    .catch(error => {
      console.error('Error sending data to middleware:', error);
    });
  };

  return (
    <iframe
        ref={iframeRef}
        src="https://h5p.ipropel.co.in/h5p/play/1036673971"
        aria-label="layoffs"
        width="1088"
        height="637"
        frameBorder="0"
        allowFullScreen={false}
        allow="autoplay *; geolocation *; microphone *; camera *; midi *; encrypted-media *"
      ></iframe>
      
  );
}
{/* <iframe src="https://hershiestech.h5p.com/content/1292197727396645047/embed" aria-label="layoffs" width="1088" height="637" frameborder="0" allowfullscreen="allowfullscreen" allow="autoplay *; geolocation *; microphone *; camera *; midi *; encrypted-media *"></iframe><script src="https://hershiestech.h5p.com/js/h5p-resizer.js" charset="UTF-8"></script> */}
