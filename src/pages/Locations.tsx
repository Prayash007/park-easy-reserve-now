
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Car } from "lucide-react";
import { Link } from "react-router-dom";

const mockLocations = [
  {
    id: 1,
    name: "Downtown Mall",
    address: "123 Main Street, City Center",
    availableSpots: 15,
    totalSpots: 50,
    pricePerHour: 5,
    distance: "0.2 miles",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    name: "Business District",
    address: "456 Corporate Avenue",
    availableSpots: 8,
    totalSpots: 30,
    pricePerHour: 8,
    distance: "0.5 miles",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    name: "City Park",
    address: "789 Park Boulevard",
    availableSpots: 22,
    totalSpots: 40,
    pricePerHour: 3,
    distance: "0.8 miles",
    image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=400&h=250&fit=crop",
  },
  {
    id: 4,
    name: "Airport Terminal",
    address: "Airport Road, Terminal 1",
    availableSpots: 45,
    totalSpots: 100,
    pricePerHour: 12,
    distance: "2.3 miles",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop",
  },
];

const Locations = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              ParkEasy
            </Link>
            <Button variant="outline">Logout</Button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Available Parking Locations
          </h1>
          <p className="text-xl text-gray-600">
            Choose from our premium parking locations
          </p>
        </div>

        {/* Locations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockLocations.map((location) => (
            <Card 
              key={location.id} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
            >
              <div className="relative">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-48 object-cover"
                />
                <Badge 
                  className={`absolute top-3 right-3 ${
                    location.availableSpots > 10 
                      ? 'bg-green-600' 
                      : location.availableSpots > 5 
                      ? 'bg-yellow-600' 
                      : 'bg-red-600'
                  }`}
                >
                  {location.availableSpots} spots
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl">{location.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {location.address}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Car className="h-4 w-4 mr-1 text-blue-600" />
                    <span>{location.availableSpots}/{location.totalSpots} available</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-green-600" />
                    <span>{location.distance}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-lg font-semibold">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>{location.pricePerHour}/hour</span>
                  </div>
                  <Link to={`/parking-lot/${location.id}`}>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={location.availableSpots === 0}
                    >
                      {location.availableSpots === 0 ? 'Full' : 'View Layout'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Locations;
