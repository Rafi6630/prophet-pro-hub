import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, Send, Paperclip, Calendar, Phone, Video, 
  Bot, Image, FileText, Mic, MoreHorizontal 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Contact {
  id: string;
  name: string;
  role: 'seller' | 'agent' | 'buyer';
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'document' | 'voice' | 'ai-suggestion';
  timestamp: Date;
  isRead: boolean;
  propertyId?: string;
}

interface Conversation {
  id: string;
  participants: Contact[];
  messages: Message[];
  propertyTitle?: string;
  lastActivity: Date;
  unreadCount: number;
}

const PropertyMessaging = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>('1');
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      participants: [
        {
          id: 'agent1',
          name: 'Sarah Ahmed',
          role: 'agent',
          avatar: '/placeholder-avatar.jpg',
          isOnline: true
        }
      ],
      messages: [
        {
          id: '1',
          senderId: 'agent1',
          content: 'Hello! I see you\'re interested in the villa in Dubai Marina. I\'d be happy to answer any questions.',
          type: 'text',
          timestamp: new Date(Date.now() - 3600000),
          isRead: true,
          propertyId: 'prop1'
        },
        {
          id: '2',
          senderId: 'user',
          content: 'Hi Sarah, yes I\'m very interested. What\'s the current market value?',
          type: 'text',
          timestamp: new Date(Date.now() - 3300000),
          isRead: true
        },
        {
          id: '3',
          senderId: 'ai',
          content: 'Based on our AI analysis, this property is valued at $1,250,000 with a 94% confidence score. The SWOT analysis shows strong potential due to waterfront location.',
          type: 'ai-suggestion',
          timestamp: new Date(Date.now() - 3000000),
          isRead: true
        }
      ],
      propertyTitle: 'Luxury Villa - Dubai Marina',
      lastActivity: new Date(Date.now() - 1800000),
      unreadCount: 0
    },
    {
      id: '2',
      participants: [
        {
          id: 'seller1',
          name: 'Mohammed Hassan',
          role: 'seller',
          avatar: '/placeholder-avatar.jpg',
          isOnline: false,
          lastSeen: '2 hours ago'
        }
      ],
      messages: [
        {
          id: '4',
          senderId: 'seller1',
          content: 'The apartment is available for viewing this weekend. Are you available Saturday morning?',
          type: 'text',
          timestamp: new Date(Date.now() - 7200000),
          isRead: false
        }
      ],
      propertyTitle: 'Modern Apartment - Business Bay',
      lastActivity: new Date(Date.now() - 7200000),
      unreadCount: 1
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConversation]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      content: messageInput,
      type: 'text',
      timestamp: new Date(),
      isRead: false
    };

    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversation
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastActivity: new Date()
            }
          : conv
      )
    );

    setMessageInput('');

    // Simulate response
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: conversations.find(c => c.id === activeConversation)?.participants[0].id || '',
        content: 'Thank you for your message. I\'ll get back to you shortly with more details.',
        type: 'text',
        timestamp: new Date(),
        isRead: false
      };

      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation
            ? {
                ...conv,
                messages: [...conv.messages, responseMessage],
                lastActivity: new Date()
              }
            : conv
        )
      );
    }, 2000);
  };

  const currentConversation = conversations.find(c => c.id === activeConversation);

  const aiSuggestions = [
    "Ask about the property's ROI potential",
    "Request a virtual tour",
    "Inquire about financing options",
    "Schedule a property viewing"
  ];

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'voice': return <Mic className="w-4 h-4" />;
      case 'ai-suggestion': return <Bot className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Property Messaging</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                    activeConversation === conversation.id ? 'bg-primary/10 border-r-2 border-primary' : ''
                  }`}
                  onClick={() => setActiveConversation(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.participants[0].avatar} />
                        <AvatarFallback>
                          {conversation.participants[0].name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.participants[0].isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-foreground truncate">
                          {conversation.participants[0].name}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.propertyTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conversation.lastActivity.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-3 flex flex-col">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={currentConversation.participants[0].avatar} />
                      <AvatarFallback>
                        {currentConversation.participants[0].name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {currentConversation.participants[0].name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {currentConversation.participants[0].role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {currentConversation.participants[0].isOnline 
                            ? 'Online' 
                            : `Last seen ${currentConversation.participants[0].lastSeen}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {currentConversation.propertyTitle && (
                  <div className="bg-muted rounded-lg p-3 mt-2">
                    <p className="text-sm font-medium text-foreground">
                      Discussing: {currentConversation.propertyTitle}
                    </p>
                  </div>
                )}
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {currentConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.senderId === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : message.type === 'ai-suggestion'
                            ? 'bg-info text-info-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {message.type === 'ai-suggestion' && (
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="w-4 h-4" />
                            <span className="text-xs font-medium">AI Assistant</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          {getMessageIcon(message.type)}
                          <div className="text-sm">{message.content}</div>
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* AI Suggestions */}
              <div className="px-4 py-2 border-t bg-muted/30">
                <div className="text-xs text-muted-foreground mb-2">AI suggestions:</div>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setMessageInput(suggestion)}
                    >
                      <Bot className="w-3 h-3 mr-1" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Image className="w-4 h-4" />
                  </Button>
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PropertyMessaging;