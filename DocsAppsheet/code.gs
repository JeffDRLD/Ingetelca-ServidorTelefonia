function fetchOpenAI(prompt, apiKey) {

  // Set up the request headers
  var headers = {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json'
  };

  // Set up the request payload
  var payload = {
    'model': 'text-davinci-003',
    'prompt': prompt,
    'max_tokens': 500
  };

  // Set up the options for the request
  var options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  // Send the request to the OpenAI API
  var url = 'https://api.openai.com/v1/completions';
  var response = UrlFetchApp.fetch(url, options);

  // Parse the response JSON
  var data = JSON.parse(response.getContentText());

  // Extract the completion text and token usage
  var completionText = data.choices[0].text.trim();
  var tokenUsage = data.usage.total_tokens.toString();

  // Return the completion text and token usage in an array format
  return [completionText, tokenUsage];
}