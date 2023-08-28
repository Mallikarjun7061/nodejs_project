const fs = require('fs');
const http = require('http');

// Read the main package.json file
const mainPackageJson = require('./package.json');

// Extract dependencies from package.json
const dependencies = mainPackageJson.dependencies;

// Create the HTML report structure
let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Dependency Usage Report</title>
  <style>
    /* Your CSS styles here */
    .dependency-list-item {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      cursor: pointer;
    }
    .dependency-name {
      margin-left: 5px;
    }
    .dependency-details {
      margin-top: 5px;
      display: none;
    }
    .dependency-details table {
      border-collapse: collapse;
      width: 40%;
      margin-top: 10px;
    }
    .dependency-details th,
    .dependency-details td {
      border: 1px solid #ddd;
      padding: 5px;
      text-align: left;
    }
    .dependency-details th {
      background-color: #f2f2f2;
    }

    /* Add border to table cells */
    .right-panel table th,
    .right-panel table td {
      border: 1px solid #ddd;
      padding: 5px;
      text-align: left;
    }

    /* Adjust layout for right panel */
    .right-panel {
      float: right;
      margin-right: 20px;
      width: 40%;
    }

    /* Fixed position for the license count table */
    .license-counts {
      position: fixed;
      top: 10px; /* Adjust this value as needed */
      right: 20px; /* Adjust this value as needed */
      background-color: white;
      padding: 10px;
      border: 1px solid #ddd;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    }
  </style>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Toggle package details visibility
      function togglePackageDetails(details) {
        details.style.display = details.style.display === 'block' ? 'none' : 'block';
      }

      // Add click handlers to dependency arrows
      const dependencyDetails = document.querySelectorAll('.dependency-details');
      dependencyDetails.forEach(details => {
        details.previousElementSibling.addEventListener('click', () => {
          togglePackageDetails(details);
        });
      });
    });
  </script>
</head>
<body>
  <div class="left-panel">
    <h1>Third Party Package</h1>
    <h3 class="summary-heading">License Usage Summary</h3>
`;

// Variable to accumulate license information
let licenseSummary = [];

// Loop through each dependency and fetch information from its module
for (const dependencyName in dependencies) {
  if (dependencies.hasOwnProperty(dependencyName)) {
    let dependencyModule;
    try {
      // Try to require the module, adjust the path as needed
      dependencyModule = require(`./node_modules/${dependencyName}/package.json`);
    } catch (error) {
      // Handle error if module is not found
      console.error(`Module ${dependencyName} not found: ${error.message}`);
    }

    if (dependencyModule) {
      // Add the package information to the HTML report
      html += `
      <div class="dependency-list-item">
        <div class="dependency-arrow">▼ ${dependencyName}</div>
      </div>
      <div class="dependency-details" style="display: none;">
        <table>
          <tr>
            <th>License</th>
            <td>${dependencyModule.license}</td>
          </tr>
          <tr>
            <th>Version</th>
            <td>${dependencyModule.version}</td>
          </tr>
          <tr>
            <th>Description</th>
            <td>${dependencyModule.description}</td>
          </tr>
          <tr>
            <th>Repository URL</th>
            <td>${dependencyModule.repository ? dependencyModule.repository.url : 'Not Available'}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>${dependencyModule.author ? dependencyModule.author : 'Not Available'}</td>
          </tr>
          <tr>
            <th>License View</th>
            <td><a href="${dependencyModule.license.url || '#'}" target="_blank">View License</a></td>
          </tr>
        </table>
      </div>
      `;

      // Add the license information to the summary
      licenseSummary.push({
        name: dependencyName,
        license: dependencyModule.license,
        version: dependencyModule.version,
      });
    }
  }
}

// Close the License Summary table
html += `
    </table>
  </div>
  <div class="right-panel">
    <div class="license-counts">
      <h3>License Counts</h3>
      <table>
        <tr>
          <th>License</th>
          <th>Count</th>
        </tr>
`;

// Create a map to store license counts
let licenseCounts = {};

// Count occurrences of each license
licenseSummary.forEach(dep => {
  const license = dep.license;
  if (licenseCounts[license]) {
    licenseCounts[license]++;
  } else {
    licenseCounts[license] = 1;
  }
});

// Add license counts to the License Counts table
for (const license in licenseCounts) {
  if (licenseCounts.hasOwnProperty(license)) {
    html += `
        <tr>
          <td>${license}</td>
          <td>${licenseCounts[license]}</td>
        </tr>
    `;
  }
}

// Close the License Counts table and other HTML elements
html += `
      </table>
    </div>
  </div>
</body>
</html>
`;

// Create a simple HTTP server to serve the report
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

// Listen on port 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
