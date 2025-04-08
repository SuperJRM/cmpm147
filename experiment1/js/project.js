// project.js - purpose and description here
// Author: Your Name
// Date:

// NOTE: This is how we might start a basic JavaaScript OOP project

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file


function main() {
  const fillers = {
    player: ["Player,", "", "Adventurer,", "Snake,", "Dragonborn,", "Tarnished,", "Helldivers,", "Crewmate,", "Hero,"],
    alert: ["Remember,", "Be careful!", "Watch out!", "Did you know?", "Check this out.", "Have you heard?", "Listen up."],
    action: ["Saving", "Wavedashing", "Blocking", "Countering", "Fighting", "Remembering", "Struggling", "Learning", "Failing", "Dodging", "Reloading", "Gaming", "Winning", "Freedom"],
    description: ["the difference between life and death", "important", "lifesaving", "less than important", "a lifestyle", "everything", "unimportant", "a requirement", "tedious", "nauseating", "epic"],
    goal: ["fighting", "living", "playing", "winning", "failing", "losing", "blocking", "saving", "countering", "surviving", "remembering", "running"],
    advice: ["fight harder", "get good", "buy microtransactions", "do more", "block", "counter", "save money", "watch your health", "keep calm", "stay alive", "hide", "pierce it with a high-performance HEAT (high-explosive, antitank) round", "run", "save"],
    primaries: ["counters", "guards", "blocking", "men", "chumps", "winners", "the government", "society", "spacies", "sword wielders", "Helldivers", "heroes", "the chosen one", "guns", "war", "you"],
    verb: ["beat", "wield", "wear", "defeat", "counter", "drink", "heal", "revive", "find", "save", "override", "ride", "restore"],
    secondaries: ["guards", "counters", "blocks", "mankind", "Super Earth", "the Storm", "the Monado", "the keyblade", "greatswords", "society", "tanks", "demons", "enemies", "Metal Gear", "Bowser"],
    target: ["Super-Earth", "Bowser", "Otacon", "Ranni", "Society", "Mankind", "Kazuya Mishima", "The Door to Darkness", "Dr. Eggman", "The imposter", "The princess", "Luigi", "The player", "Donkey Kong", "The Pope"],
    message: ["counting on you", "waiting", "fighting back", "lying in wait", "reporting for duty", "watching", "a lie", "our last hope", "requesting backup", "sending in reinforcements"],
    
  };
  
  const template = `
  $player $alert
  
  $action isn't just important, it's $description. 
  
  To keep $goal, try to $advice.
  
  Only $primaries can $verb $secondaries. 
  
  $target is $message!
  `;
  
  const slotPattern = /\$(\w+)/;
  
  function replacer(match, name) {
    let options = fillers[name];
    if (options) {
      return options[Math.floor(Math.random() * options.length)];
    } else {
      return `<UNKNOWN:${name}>`;
    }
  }
  
  function generate() {
    let story = template;
    while (story.match(slotPattern)) {
      story = story.replace(slotPattern, replacer);
    }
  
    /* global box */
    box.innerText = story;
  }
  
  /* global clicker */
  clicker.onclick = generate;
  
  generate();
  
}

main();