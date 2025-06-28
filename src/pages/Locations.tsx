
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Car } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  total_spots: number;
  price_per_hour: number;
  distance: string;
  image_url: string;
  available_spots: number;
}

const Locations = () => {
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      // Fetch parking locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('parking_locations')
        .select('*');

      if (locationsError) throw locationsError;

      // For each location, count available spots
      const locationsWithAvailability = await Promise.all(
        locationsData.map(async (location) => {
          const { count: occupiedCount } = await supabase
            .from('parking_spots')
            .select('*', { count: 'exact', head: true })
            .eq('location_id', location.id)
            .eq('is_occupied', true);

          return {
            ...location,
            available_spots: location.total_spots - (occupiedCount || 0),
          };
        })
      );

      setLocations(locationsWithAvailability);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              ParkEasy
            </Link>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
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
          {locations.map((location) => (
            <Card 
              key={location.id} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
            >
              <div className="relative">
                <img
                  src={location.image_url}
                  alt={location.name}
                  className="w-full h-48 object-cover"
                />
                <Badge 
                  className={`absolute top-3 right-3 ${
                    location.available_spots > 10 
                      ? 'bg-green-600' 
                      : location.available_spots > 5 
                      ? 'bg-yellow-600' 
                      : 'bg-red-600'
                  }`}
                >
                  {location.available_spots} spots
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
                    <span>{location.available_spots}/{location.total_spots} available</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-green-600" />
                    <span>{location.distance}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-lg font-semibold">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>${location.price_per_hour}/hour</span>
                  </div>
                  <Link to={`/parking-lot/${location.id}`}>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={location.available_spots === 0}
                    >
                      {location.available_spots === 0 ? 'Full' : 'View Layout'}
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
