import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Mic, MicOff, Languages, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  language?: string;
}

interface Suggestion {
  text: string;
  category: 'valuation' | 'search' | 'investment' | 'market';
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI real estate assistant. I can help you with property valuations, market insights, investment analysis, and answer any questions about real estate. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ku', name: 'کوردی', flag: '🏴' }
  ];

  const suggestions: Suggestion[] = [
    { text: "What's the current market value of this property?", category: 'valuation' },
    { text: "Show me properties with high ROI potential", category: 'investment' },
    { text: "What are the market trends in Dubai Marina?", category: 'market' },
    { text: "Help me calculate investment returns", category: 'investment' },
    { text: "Find properties near schools and metro", category: 'search' },
    { text: "Explain the SWOT analysis for this area", category: 'market' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      language: currentLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        language: currentLanguage
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('valuation') || lowerInput.includes('value') || lowerInput.includes('price')) {
      return `Based on current market analysis, I can provide you with an AI-powered valuation. The property appears to be valued at approximately $1,250,000 with a confidence score of 94%. This estimate considers comparable sales, market trends, and property features. Would you like me to show you the detailed SWOT analysis?`;
    }
    
    if (lowerInput.includes('roi') || lowerInput.includes('investment') || lowerInput.includes('return')) {
      return `For investment analysis, this property shows promising returns. Based on current rental rates and market appreciation trends, you can expect an ROI of approximately 15.2% and an IRR of 12.8%. The rental yield is estimated at 9.6%. Would you like me to run different scenarios for you?`;
    }
    
    if (lowerInput.includes('market') || lowerInput.includes('trend')) {
      return `The current market shows positive trends with a 5.2% year-over-year growth. Key factors driving this include population growth, infrastructure development, and strong tourism recovery. The area is experiencing high demand, particularly for properties with modern amenities. Would you like specific neighborhood insights?`;
    }
    
    if (lowerInput.includes('search') || lowerInput.includes('find') || lowerInput.includes('property')) {
      return `I can help you find the perfect property! Based on our conversation, I recommend focusing on waterfront properties in prime locations. Our AI has identified 15 properties matching your criteria with growth scores above 80. Would you like me to show you the top matches?`;
    }
    
    return `I understand you're asking about "${input}". As your AI real estate assistant, I can help with property valuations, investment analysis, market insights, and property searches. Could you provide more specific details about what you'd like to know? I'm here to make your real estate decisions easier with data-driven insights.`;
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInputValue(suggestion.text);
  };

  const toggleVoiceInput = () => {
    if (!isListening) {
      // Start voice recognition
      setIsListening(true);
      // Implement speech recognition here
      setTimeout(() => {
        setIsListening(false);
        setInputValue("What's the market value of a 3-bedroom apartment in Dubai Marina?");
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'valuation': return 'bg-primary text-primary-foreground';
      case 'investment': return 'bg-success text-success-foreground';
      case 'market': return 'bg-info text-info-foreground';
      case 'search': return 'bg-warning text-warning-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              <span>AI Real Estate Assistant</span>
              <Badge variant="secondary" className="text-xs">
                Powered by GPT-4
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-muted-foreground" />
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                className="text-sm bg-background border border-border rounded px-2 py-1"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground p-3 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-2">Quick suggestions:</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${getCategoryColor(suggestion.category)}`} />
                  {suggestion.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about real estate..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="pr-12"
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute right-1 top-1/2 transform -translate-y-1/2 ${
                  isListening ? 'text-destructive' : 'text-muted-foreground'
                }`}
                onClick={toggleVoiceInput}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
            <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;