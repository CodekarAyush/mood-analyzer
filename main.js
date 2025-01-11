require('dotenv').config();
class MoodAnalyzer {
  constructor() {
    this.textInput = document.getElementById("textInput");
    this.analyzeBtn = document.getElementById("analyzeBtn");
    this.speakBtn = document.getElementById("speakBtn");
    this.resultDiv = document.getElementById("result");
    this.apiToken = process.env.API_TOKEN
    this.moodEmoji = document.getElementById("moodEmoji");
    this.lastAnalysis = "";
    this.initialEventListener();
  }
  initialEventListener() {
    this.analyzeBtn.addEventListener("click", () => {
      this.analyMood();
    });
    this.speakBtn.addEventListener("click", () => {
      this.speakResult();
    });
  }
  async analyMood() {
    const text = this.textInput.value.trim();
    if (!text) {
      this.showResult("Please enter some text to analyse");
      return;
    }
    this.analyzeBtn.disabled = true;
    this.analyzeBtn.innerHTML = `<span class="spinner-border spinner-border-sm"> </span> Analizing...`;
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ this.apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );
      const result = await response.json();
      this.processResult(result[0]);
    } catch (error) {
      console.log(error);
    } finally {
      this.analyzeBtn.disabled = false;
      this.analyzeBtn.textContent = "Analyze Mood";
    }
  }
  processResult(result) {
    console.log(result[0]);
    
    const topEmotion = result[0] //result.sort((a, b) => b.score - a.score);
    const emoji = this.getEmoji(topEmotion.label);
    const confidence = Math.round(topEmotion.score * 100);
    this.lastAnalysis = `I detected ${topEmotion.label} with ${confidence} % confidence`;
    this.showResult(this.lastAnalysis, emoji);
    this.speakBtn.disabled = false;
  }
  getEmoji(emotion) {
    const emojiMap = {
      joy: "😄", // Happiness or Joy
      sadness: "😢", // Sadness
      anger: "😡", // Anger
      fear: "😨", // Fear
      surprise: "😲", // Surprise
      disgust: "🤢", // Disgust
      love: "❤️", // Love
      neutral: "😐", // Neutral or No strong emotion
      excitement: "🤩", // Excitement
      confusion: "😕", // Confusion
      pride: "😌", // Pride
      shame: "😳", // Shame
      guilt: "😔", // Guilt
      optimism: "😊", // Optimism
      frustration: "😤", // Frustration
    };
    return emojiMap[emotion] || "😐";
  }
  showResult ( message, emoji = null){
    this.resultDiv.textContent = message
    if (emoji) {
        this.moodEmoji.textContent = emoji 
    }

  }
  speakResult(){
    if (!this.lastAnalysis) {
        return
    }
    const utterance = new SpeechSynthesisUtterance(this.lastAnalysis)
    speechSynthesis.speak(utterance)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new MoodAnalyzer();
});
