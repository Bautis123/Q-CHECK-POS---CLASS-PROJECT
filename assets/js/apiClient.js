export class ApiClient {
  constructor(baseUrl = "api/index.php") {
    this.baseUrl = baseUrl;
  }

  async get(resource, action = "index") {
    return this.request(resource, action);
  }

  async post(resource, action, payload) {
    return this.request(resource, action, payload);
  }

  async request(resource, action = "index", payload = null) {
    const isFormData = payload instanceof FormData;
    const options = payload
      ? {
          method: "POST",
          headers: isFormData ? {} : { "Content-Type": "application/json" },
          body: isFormData ? payload : JSON.stringify(payload)
        }
      : {};
    const response = await fetch(`${this.baseUrl}?resource=${resource}&action=${action}`, options);
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "API request failed.");
    }
    return result.data;
  }
}
