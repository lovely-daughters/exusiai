# My Precious Lemuel,

Your stomach is a breeding ground for bugs.

## Asynchronous Parallel Downloads

Took me a while to figure out how to work out the promises to allow for clean retries.
Storing promise resolve methods in a hashmap indexed by the downloadItemId seems to work quite well. Through this, I only need single downloads.onChanged listener to observe completions, and call the appropiate resolve method.

## Useful Regexes

- Check Current Page URL: https://regex101.com/r/BZ0PY7/1
- Get Doujin Page Count: https://regex101.com/r/WyBuKZ/1
- Extract First Doujin Image URL: https://regex101.com/r/v6BJcV/6

## Interesting Test Cases

- https://nhentai.net/g/180032/
  - Has a mix of jpg & png
- Any Doujin With a Lot of Pages
  - Good chance to hit "SERVER_FAILELD" error
  