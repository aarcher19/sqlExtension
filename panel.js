chrome.devtools.network.onRequestFinished.addListener(handleRequest);

function handleRequest(request) {
  request.getContent((body) => {
    if (!isJsonWithDevQueries(request, body)) return;

    const json = safelyParseJson(body);
    if (!json || !json._dev?.queries) return;

    const queries = extractQueries(json._dev.queries);
    const formattedQueries = queries.map(formatQuery);

    renderEndpointBlock(request.request.url, formattedQueries);
  });
}

// --- Helpers ---

function isJsonWithDevQueries(request, body) {
  const contentType = request.response.content.mimeType || "";
  return contentType.includes("json") && body.includes("_dev");
}

function safelyParseJson(body) {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function extractQueries(rawQueryString) {
  return rawQueryString.split(/\n\s*\n/).filter(q => q.trim());
}

function formatQuery(query) {
  return sqlFormatter.format(query.trim());
}

function renderEndpointBlock(endpoint, formattedQueries) {
  const container = document.getElementById("queries");

  const endpointDetails = document.createElement("details");
  endpointDetails.open = true;

  const summary = document.createElement("summary");
  summary.textContent = `${endpoint} (${formattedQueries.length} queries)`;
  endpointDetails.appendChild(summary);

  formattedQueries.forEach((queryText, i) => {
    const queryDetails = document.createElement("details");
    queryDetails.style.marginLeft = "1em";

    const querySummary = document.createElement("summary");
    querySummary.textContent = `Query ${i + 1}`;

    const pre = document.createElement("pre");
    pre.textContent = queryText;

    queryDetails.appendChild(querySummary);
    queryDetails.appendChild(pre);
    endpointDetails.appendChild(queryDetails);
  });

  container.prepend(endpointDetails);
}
