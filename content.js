const origFetch = window.fetch;
window.fetch = async (...args) => {
    const response = await origFetch(...args);
    const clone = response.clone();

    try {
        const url = args[0];
        const contentType = clone.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            const json = await clone.json();

            if (json._dev && json._dev.queries) {
                const endpoint = new URL(url, location.href).pathname;

                renderQueryBlock(endpoint, json._dev.queries, json._dev.count);
            }
        }
    } catch (e) {
        console.warn("SQL Dev Hook failed:", e);
    }
    return response;
}

function renderQueryBlock(endpoint, queries, count) {
    const container = document.getElementById("queries");

    const endpointDetails = document.createElement("details");
    endpointDetails.open = true;

    const summary = document.createElement("summary");
    summary.textContent = `${endpoint} (${count} queries)`;
    endpointDetails.appendChild(summary);

    queries.forEach((q, i) => {
        const queryDetails = document.createElement("details");
        const querySummary = document.createElement("summary");
        querySummary.textContent = `Query ${i + 1}`;

        const pre = document.createElement("pre");
        pre.textContent = q;

        queryDetails.appendChild(querySummary);
        queryDetails.appendChild(pre);
        endpointDetails.appendChild(queryDetails);
    });

    container.prepend(endpointDetails);
}
