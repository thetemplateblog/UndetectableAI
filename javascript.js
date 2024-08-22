function humanizeContent(params, userSettings) {
    return new Promise((resolve, reject) => {
      // Ensure required parameters are provided
      if (!params || !userSettings) {
        console.error("Missing input parameters or user settings.");
        return reject("Missing input parameters or user settings.");
      }
  
      const keyword = params.keyword || "YOUR TEXT GOES HERE. PLEASE MAKE SURE IT IS AT LEAST 50 CHARACTERS LONG.";
      const APIKey = userSettings.APIKey;
      if (!APIKey) {
        console.error("Missing API Key in user settings.");
        return reject("Missing API Key in user settings.");
      }
      
      const readability = userSettings.readability || "High School";
      const purpose = userSettings.purpose || "General Writing";
      const strength = userSettings.strength || "Balanced";
  
      var myHeaders = new Headers();
      myHeaders.append("api-key", APIKey);
      myHeaders.append("Content-Type", "application/json");
  
      const raw = JSON.stringify({
        content: keyword,
        readability: readability,
        purpose: purpose,
        strength: strength,
      });
  
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };
  
      // Initial fetch to submit the document
      fetch("https://api.undetectable.ai/submit", requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json(); // Assuming the response contains JSON with document ID
        })
        .then(result => {
          const documentId = result.id;
          checkDocumentStatus(documentId, myHeaders, resolve, reject);
        })
        .catch(error => {
          console.error('Error:', error);
          reject(error);
        });
    });
  }
  
  function checkDocumentStatus(documentId, headers, resolve, reject) {
    const checkInterval = 30000; // 30 seconds
  
    const intervalId = setInterval(() => {
      const raw = JSON.stringify({ "id": documentId });
      const requestOptions = {
        method: 'POST',
        headers: headers,
        body: raw,
        redirect: 'follow'
      };
  
      fetch("https://api.undetectable.ai/document", requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json(); // Assuming the response JSON contains the document status
        })
        .then(result => {
          if (result.status === 'ready') { // Replace 'ready' with the actual ready status value
            clearInterval(intervalId);
            resolve(result.document); // Assuming result contains the document data when ready
          } else {
            console.log('Document is not ready. Checking again in 30 seconds...');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          clearInterval(intervalId);
          reject(error);
        });
    }, checkInterval);
  }
  