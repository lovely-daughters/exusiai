# My Precious Lemuel,

<!-- Your stomach is a breeding ground for bugs. -->

![Lemuel](images/exu_e2.png)

## Asynchronous Parallel Downloads

Took me a while to figure out how to work out the promises to allow for clean retries.
Storing promise resolve methods in a hashmap indexed by the downloadItemId seems to work quite well. Through this, I only a need single downloads.onChanged listener to observe completions and call the appropiate resolve method.

Furthermore, I've implemented a worker/manager system for controlling the # of download threads.

## Interesting Test Cases

- Doujins w. mix of JPG & PNG
  - "SERVER_BAD_CONTENT"
- Any Doujin With a Lot of Pages
  - "SERVER_FAILELD"
  
## Useful Regexes

- Check Current Page URL: https://regex101.com/r/BZ0PY7/1
- Get Doujin Page Count: https://regex101.com/r/WyBuKZ/1
- Extract First Doujin Image URL: https://regex101.com/r/v6BJcV/6
