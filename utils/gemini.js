const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

require("dotenv").config();

async function generateIcebreakers(promtData) {
    const MODEL_NAME = "gemini-1.5-pro-latest";
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_SECRET_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 1,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 8192,
    };
    
    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];
    
    const parts = [
        { text: "input: You want to start some interesting conversations. You decide to use their recent social post's captions, comments, and messages as inspiration for ice breakers, without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: 1. yass go queen, 2. hehehe, 3. lets go to brazil, 4. i just loved it, 5. great trip it was. Generate the data in the form of JavaScript array of strings." },
        { text: "output: [\n    \"Feeling adventurous lately? 'Yass go queen' vibes!\",\n    \"Got any exciting plans? 'Hehehe' makes me think you're up to something fun!\",\n    \"Thinking about a getaway? 'Let's go to Brazil' sounds like a great idea!\",\n    \"What's got you all excited? 'I just loved it' has me intrigued!\",\n    \"Reflecting on past adventures? 'Great trip it was' must have been memorable!\",\n    \"You seem like you're full of energy! 'Yass go queen' has me ready to conquer the day!\",\n    \"Need a laugh? 'Hehehe' is contagious!\",\n    \"Dreaming of exotic destinations? 'Let's go to Brazil' sounds like the perfect escape!\",\n    \"Curious about your latest experience! 'I just loved it' has me curious!\",\n    \"Reminiscing about past travels? 'Great trip it was' brings back memories!\"\n]" },
        { text: "input: You want to start some interesting conversations. You decide to use their recent social post's captions, comments, and messages as inspiration for ice breakers, without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: 1. just chilling, 2. hehe, 3. let's go hiking, 4. loving it, 5. awesome day!. Generate the data in the form of JavaScript array of strings." },
        { text: "output: [\n    \"Feeling relaxed? 'Just chilling' sounds like a good vibe!\",\n    \"What's amusing you? 'Hehe' gives me a chuckle!\",\n    \"Fancy a hike? 'Let's go hiking' could be a great adventure!\",\n    \"What are you enjoying? 'Loving it' has me curious!\",\n    \"Sounds like a great day! 'Awesome day!' has me smiling!\"\n]" },
        { text: "input: You want to start some interesting conversations. You decide to use their recent social post's captions, comments, and messages as inspiration for ice breakers, without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: 1. having fun, 2. lol, 3. let's travel, 4. amazing!, 5. best day ever. Generate the data in the form of JavaScript array of strings." },
        { text: "output: [\n    \"Seems like a good time! 'Having fun' always brings smiles!\",\n    \"What's so funny? 'lol' has me curious!\",\n    \"Feeling wanderlust? 'Let's travel' sounds like an adventure!\",\n    \"What's amazing? 'Amazing!' has me intrigued!\",\n    \"Sounds like an awesome day! 'Best day ever' has me smiling!\"\n]" },
        { text: "input: You want to start some interesting conversations. You decide to use their recent social post's captions, comments, and messages as inspiration for ice breakers, without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: 1. loving life, 2. haha, 3. let's explore, 4. incredible, 5. unforgettable moments. Generate the data in the form of JavaScript array of strings." },
        { text: "output: [\n    \"Feeling content? 'Loving life' is a great mindset!\",\n    \"What's amusing you? 'Haha' always brings a smile!\",\n    \"Up for an adventure? 'Let's explore' sounds exciting!\",\n    \"What's so impressive? 'Incredible' has me intrigued!\",\n    \"Memories to cherish? 'Unforgettable moments' are the best!\"\n]" },
        { text: "input: You want to start some interesting conversations. You decide to use their recent social post's captions, comments, and messages as inspiration for ice breakers, without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: 1. feeling great, 2. lol, 3. let's go on a road trip, 4. awesome, 5. living the dream. Generate the data in the form of JavaScript array of strings." },
        { text: "output: [\n    \"Glad to hear it! 'Feeling great' is always a good vibe!\",\n    \"What's tickling your funny bone? 'lol' has me curious!\",\n    \"Road trip, anyone? 'Let's go on a road trip' sounds like an adventure!\",\n    \"What's so awesome? 'Awesome' has me intrigued!\",\n    \"Living your best life? 'Living the dream' sounds amazing!\"\n]" },
        { text: "input: You want to start some interesting conversations. You decide to use their recent social post's captions, comments, and messages as inspiration for ice breakers, without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: 1. feeling excited, 2. haha, 3. let's plan a trip, 4. fantastic, 5. making memories. Generate the data in the form of JavaScript array of strings." },
        { text: "output: [\n    \"Excited about something? 'Feeling excited' has me curious!\",\n    \"What's giving you a good laugh? 'Haha' always brightens the mood!\",\n    \"Planning an adventure? 'Let's plan a trip' sounds like fun!\",\n    \"What's so fantastic? 'Fantastic' has me intrigued!\",\n    \"Creating lasting memories? 'Making memories' is the best!\"\n]" },
        { text: "input: You want to start some interesting conversations. You decide to use their recent social post's captions, comments, and messages as inspiration for ice breakers, without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: 1. feeling adventurous, 2. haha, 3. let's go on an adventure, 4. amazing!, 5. living the life. Generate the data in the form of JavaScript array of strings." },
        { text: "output: [\n    \"Ready for an adventure? 'Feeling adventurous' has me curious!\",\n    \"What's giving you a good laugh? 'Haha' always brightens the mood!\",\n    \"Adventure awaits! 'Let's go on an adventure' sounds exciting!\",\n    \"What's so amazing? 'Amazing!' has me intrigued!\",\n    \"Living your best life? 'Living the life' sounds fantastic!\"\n]" },
        { text: "input: You want to start some interesting conversations. You decide to use their recent social post's captions, comments, and messages as inspiration for ice breakers, without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: 1. feeling pumped, 2. haha, 3. let's explore new places, 4. incredible, 5. unforgettable experiences. Generate the data in the form of JavaScript array of strings." },
        { text: "output: [\n    \"Feeling energized? 'Feeling pumped' has me curious!\",\n    \"What's so funny? 'Haha' always brings a smile!\",\n    \"Adventure time! 'Let's explore new places' sounds like fun!\",\n    \"What's so impressive? 'Incredible' has me intrigued!\",\n    \"Creating memories? 'Unforgettable experiences' are the best!\"\n]" },
        { text: "input: You want to start some interesting conversations. You decide to use their recent social post's captions, comments, and messages as inspiration for ice breakers, without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: 1. feeling awesome, 2. lol, 3. let's go on a journey, 4. fantastic, 5. making dreams come true. Generate the data in the form of JavaScript array of strings." },
        { text: "output: [\n    \"Feeling fantastic? 'Feeling awesome' sounds great!\",\n    \"What's so funny? 'lol' always brightens the mood!\",\n    \"Ready for an adventure? 'Let's go on a journey' sounds exciting!\",\n    \"What's so fantastic? 'Fantastic' has me intrigued!\",\n    \"Chasing dreams? 'Making dreams come true' is inspiring!\"\n]" },
        { text: "input: You want to start some interesting conversations. You decide to use their recent social post's captions, comments, and messages as inspiration for ice breakers, without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: 1. feeling fantastic, 2. haha, 3. let's go on a road trip, 4. awesome, 5. living the dream. Generate the data in the form of JavaScript array of strings." },
        { text: "output: [\n    \"Feeling fantastic? 'Feeling fantastic' sounds great!\",\n    \"What's so funny? 'haha' always brightens the mood!\",\n    \"Road trip, anyone? 'Let's go on a road trip' sounds like an adventure!\",\n    \"What's so awesome? 'Awesome' has me intrigued!\",\n    \"Living the dream? 'Living the dream' sounds amazing!\"\n]" },
        { text: "input: You want to start some interesting conversations. You decide to use their recent social post's captions, comments, and messages as inspiration for ice breakers, without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: 1. feeling pumped up, 2. haha, 3. let's explore new horizons, 4. amazing, 5. unforgettable memories. Generate the data in the form of JavaScript array of strings." },
        { text: "output: [\n    \"Feeling pumped up? 'Feeling pumped up' sounds exciting!\",\n    \"What's giving you a good laugh? 'haha' always brightens the mood!\",\n    \"Adventure awaits! 'Let's explore new horizons' sounds like fun!\",\n    \"What's so amazing? 'amazing' has me intrigued!\",\n    \"Cherishing memories? 'unforgettable memories' are the best!\"\n]" },
        { text: "input: You want to start some interesting conversations. You decide to use their recent social media post captions and comments as inspiration for ice breakers, without addressing any emotional or personal moments. Here are some of their recent posts and comments: 1. Exploring new hobbies is always fun!, 2. Just finished reading an amazing book!, 3. Spent the weekend hiking in the mountains!, 4. Trying out new recipes in the kitchen! 5. Enjoying a quiet night in with some hot chocolate!. Generate ice breakers or conversation starters based on the provided captions and comments." },
        { text: "output: " },
    ];
    
    const promtMessage = "You want to start some interesting conversations. You decide to use their recent social post's captions and comments as inspiration for ice breakers without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: ";
    
    const promtOutput = 'Generate the ice breakers in the form of array of strings.';
    
    const prompt = promtMessage + promtData + '. ' + promtOutput;
    
    const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
        safetySettings,
    });
    
    const response = result.response.text();
    
    return [response.split('[')[1].split(']')[0]];
}

module.exports = generateIcebreakers;