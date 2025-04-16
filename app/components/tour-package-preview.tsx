import MessengerInterface from "@/app/dashboard/messenger-chat"
import WhatsAppTourismChat from "@/app/dashboard/whatsapp-chat"
import { Alert } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Package } from "@/lib/services/search-packages"
import { ArrowLeft, Calendar, Clock, Globe, Info, MapPin, MessageCircle, Share, Star, Users, X } from "lucide-react"
import { MouseEvent, WheelEvent, useState } from "react"
import ReactMarkdown from "react-markdown"

interface ExtendedPackage extends Package {
    isAIGenerated?: boolean;
    itinerary?: {
        day: number;
        title: string;
        schedule: {
            time: string;
            description: string;
            details?: string;
        }[];
    }[];
    trip_type?: string;
    ideal_for?: string[];
    best_season?: string;
    // New API fields
    location_input?: string;
    budget_input?: string;
    accommodation_input?: string;
    activities_input?: string;
    num_participants?: number;
    preferred_activities?: string;
    accommodation_preference?: string;
    budget_range?: string;
    duration_adjustment?: string;
    match_count?: number;
    provider_name?: string;
}

interface TourPackagePreviewProps {
    isOpen: boolean;
    onClose: () => void;
    package?: ExtendedPackage | null;
}

export default function TourPackagePreview({ isOpen, onClose, package: pkg }: TourPackagePreviewProps) {
    const [showChat, setShowChat] = useState<'whatsapp' | 'messenger' | null>(null);

    if (!isOpen) return null;

    // Prevent scroll propagation
    const handleScroll = (e: WheelEvent) => {
        e.stopPropagation();
    };

    // Prevent any potential mousedown/mouseup propagation issues
    const handleMouseEvents = (e: MouseEvent) => {
        e.stopPropagation();
    };

    // Toggle chat
    const toggleChat = (chatType: 'whatsapp' | 'messenger') => {
        setShowChat(showChat === chatType ? null : chatType);
    };

    // Helper functions to extract data from API format
    const getLocationDisplay = () => {
        return pkg?.location_id || pkg?.location_input || "Destination";
    };

    const getPriceDisplay = () => {
        if (pkg?.price) return pkg.price.toLocaleString();
        if (pkg?.budget_range) {
            // Extract numeric value from budget range
            const match = pkg.budget_range.match(/\$(\d+)-\$(\d+)/);
            if (match) {
                const min = parseInt(match[1]);
                const max = parseInt(match[2]);
                return Math.floor((min + max) / 2).toLocaleString();
            }
        }
        return pkg?.budget_input === "luxury" ? "2,000" :
            pkg?.budget_input === "mid-range" ? "1,200" : "800";
    };

    const getDurationDays = () => {
        if (pkg?.duration_days) return pkg.duration_days;
        if (pkg?.duration_adjustment) {
            const match = pkg.duration_adjustment.match(/(\d+)/);
            if (match) return parseInt(match[0]);
        }
        return 7; // Default to 7 days
    };

    const getActivitiesList = () => {
        const activities: string[] = [];
        if (pkg?.highlights && pkg.highlights.length > 0) {
            return pkg.highlights;
        }

        if (pkg?.activities_input) {
            activities.push(...pkg.activities_input.split(',').map(a => a.trim()));
        }

        if (pkg?.preferred_activities) {
            const preferred = pkg.preferred_activities.split(',').map(a => a.trim());
            // Add only unique activities
            preferred.forEach(p => {
                if (!activities.includes(p)) activities.push(p);
            });
        }

        return activities.length > 0 ? activities : [];
    };

    const getAccommodationType = () => {
        return pkg?.trip_type || pkg?.accommodation_preference || pkg?.accommodation_input || "Hotel";
    };

    const getPackageTitle = () => {
        return pkg?.title ||
            `${getLocationDisplay()} ${getDurationDays()}-Day ${getAccommodationType()} Experience`;
    };

    const getIdealFor = () => {
        let idealFor = pkg?.ideal_for || [];

        if (!idealFor.length && pkg?.num_participants) {
            if (pkg.num_participants === 2) {
                idealFor = ["Couples", "Friends"];
            } else if (pkg.num_participants > 2) {
                idealFor = ["Families", "Groups"];
            } else {
                idealFor = ["Solo travelers", "Couples"];
            }
        }

        return idealFor;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 h-[95vh] max-h-[95vh] flex flex-col overflow-hidden">
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <header className="sticky top-0 z-10 bg-white border-b">
                        <div className="flex items-center p-2">
                            <Button variant="ghost" size="icon" className="mr-2" onClick={onClose}>
                                <ArrowLeft className="w-5 h-5" />
                                <span className="sr-only">Back</span>
                            </Button>
                            <h1 className="text-lg font-semibold">Tour Package Preview</h1>
                        </div>
                    </header>

                    {/* Preview Banner */}
                    <div className="bg-blue-50 px-2 py-3 border-b border-blue-200">
                        <Alert className="bg-white border-blue-200 py-2 flex items-center">
                            <div className="flex items-center justify-center mr-2">
                                <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            </div>
                            <span className="text-blue-600 font-medium mr-1">Preview Mode:</span>
                            <span className="text-sm">This is how your tour package will appear on Facebook Marketplace. Review all details before submitting.</span>
                        </Alert>
                    </div>

                    {/* Main Content - Scrollable */}
                    <div className="flex-1 flex overflow-hidden">
                        <div
                            className={`${showChat ? 'w-2/3' : 'w-full'} overflow-auto`}
                            onWheel={handleScroll}
                            onMouseDown={handleMouseEvents}
                            onMouseUp={handleMouseEvents}
                        >
                            <div className="p-0 max-w-3xl mx-auto">
                                {/* Tour Images */}
                                <div className="relative">
                                    <div className="aspect-[16/9] overflow-hidden">
                                        <img
                                            src={pkg?.image_url || `https://source.unsplash.com/random/800x450/?${getLocationDisplay().toLowerCase()},travel`}
                                            alt={getPackageTitle()}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm"
                                    >
                                        <Share className="h-5 w-5" />
                                        <span className="sr-only">Share</span>
                                    </Button>
                                </div>

                                {/* Tour Details */}
                                <div className="p-4 bg-white">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Badge className="mb-1 bg-green-100 text-green-800 hover:bg-green-100 border-0">Tour Package</Badge>
                                            <h1 className="text-xl font-bold leading-tight">{getPackageTitle()}</h1>
                                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                <span>{getLocationDisplay()}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">${getPriceDisplay()}</div>
                                            <div className="text-sm text-muted-foreground">per person</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center mt-4 gap-1">
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        <span className="text-sm ml-1">New listing</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <Card>
                                            <CardContent className="p-3 flex items-center">
                                                <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                                                <div>
                                                    <div className="text-sm font-medium">Duration</div>
                                                    <div className="text-sm text-muted-foreground">{getDurationDays()} days</div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-3 flex items-center">
                                                <Users className="h-5 w-5 mr-3 text-blue-600" />
                                                <div>
                                                    <div className="text-sm font-medium">Accommodation</div>
                                                    <div className="text-sm text-muted-foreground">{getAccommodationType()}</div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        {pkg?.best_season && (
                                            <Card>
                                                <CardContent className="p-3 flex items-center">
                                                    <Clock className="h-5 w-5 mr-3 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm font-medium">Best Season</div>
                                                        <div className="text-sm text-muted-foreground">{pkg.best_season}</div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                        {getIdealFor().length > 0 && (
                                            <Card>
                                                <CardContent className="p-3 flex items-center">
                                                    <Globe className="h-5 w-5 mr-3 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm font-medium">Ideal For</div>
                                                        <div className="text-sm text-muted-foreground">{getIdealFor().join(', ')}</div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    <Separator className="my-3" />

                                    {/* Description Section */}
                                    <div className="mt-4">
                                        <h3 className="text-lg font-semibold mb-2">Overview</h3>
                                        <div className="text-sm space-y-4">
                                            {pkg?.description ? (
                                                <ReactMarkdown>{pkg.description}</ReactMarkdown>
                                            ) : (
                                                <>
                                                    <p>
                                                        Experience the beauty of {getLocationDisplay()} with our {getDurationDays()}-day
                                                        {getAccommodationType() === 'luxury' ? ' luxury' : ''} tour package.
                                                        Enjoy {getActivitiesList().slice(0, 3).join(', ')} and more during your stay.
                                                    </p>
                                                    <p>
                                                        Our experienced local guides will ensure you discover both famous landmarks and hidden gems while
                                                        immersing yourself in local culture and traditions.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Itinerary Section - Conditionally displayed */}
                                    {pkg?.itinerary && pkg.itinerary.length > 0 && (
                                        <>
                                            <Separator className="my-3" />
                                            <div className="mt-4">
                                                <h3 className="text-lg font-semibold mb-2">Itinerary</h3>
                                                <div className="text-sm space-y-4">
                                                    {pkg.itinerary.map((day, idx) => (
                                                        <div key={idx}>
                                                            <h3 className="font-semibold">Day {day.day}: {day.title}</h3>
                                                            <div className="space-y-2 mt-2">
                                                                {day.schedule.map((item, schedIdx) => (
                                                                    <div key={schedIdx}>
                                                                        <p><span className="text-blue-600 font-medium">{item.time}</span> – {item.description}</p>
                                                                        {item.details && (
                                                                            <p className="text-xs text-gray-500 mt-1">{item.details}</p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Includes Section */}
                                    <Separator className="my-3" />
                                    <div className="mt-4">
                                        <h3 className="text-lg font-semibold mb-2">Extended Services</h3>
                                        <div className="text-sm space-y-2">
                                            {getActivitiesList().map((activity, idx) => (
                                                <p key={idx}>✓ {activity}</p>
                                            ))}
                                            <p>✓ {getDurationDays() - 1} nights accommodation ({getAccommodationType()})</p>
                                            <p>✓ Transportation during tour</p>
                                            <p>✓ Professional guide</p>
                                            <p className="text-muted-foreground">✗ Personal expenses</p>
                                            <p className="text-muted-foreground">✗ Optional activities</p>
                                        </div>
                                    </div>

                                    <Separator className="my-3" />

                                    {/* Seller Info */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Avatar className="h-12 w-12 mr-3 border">
                                                <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Seller" />
                                                <AvatarFallback>{pkg?.provider_name?.substring(0, 2) || pkg?.provider_id?.substring(0, 2) || "TP"}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold">{pkg?.provider_name || pkg?.provider_id || "Premium Travel"}</h3>
                                                <p className="text-sm text-muted-foreground">Licensed Tour Provider</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full"
                                                onClick={() => toggleChat('whatsapp')}
                                            >
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                WhatsApp
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full"
                                                onClick={() => toggleChat('messenger')}
                                            >
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                Messenger
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat Sidebar */}
                        {showChat && (
                            <div className="w-1/3 relative border-l">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 z-20"
                                    onClick={() => setShowChat(null)}
                                >
                                    <X size={16} />
                                </Button>
                                <div className="h-full">
                                    {showChat === 'whatsapp' && <WhatsAppTourismChat />}
                                    {showChat === 'messenger' && <MessengerInterface />}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Actions */}
                    <div className="sticky bottom-0 z-10 bg-white border-t p-2">
                        <div className="max-w-3xl mx-auto flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={onClose}>
                                Edit Package
                            </Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Submit to Marketplace</Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 