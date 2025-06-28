
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Car, Clock, DollarSign } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ParkingLocation {
  id: string;
  name: string;
  price_per_hour: number;
  rows: number;
  spots_per_row: number;
  total_spots: number;
}

interface ParkingSpot {
  id: string;
  spot_number: number;
  is_occupied: boolean;
  booked_by?: string;
}

const ParkingLot = () => {
  const { locationId } = useParams();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [parkingData, setParkingData] = useState<ParkingLocation | null>(null);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (locationId) {
      fetchParkingData();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('parking-spots-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'parking_spots',
            filter: `location_id=eq.${locationId}`
          },
          (payload) => {
            console.log('Real-time update:', payload);
            fetchParkingSpots();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [locationId]);

  const fetchParkingData = async () => {
    try {
      // Fetch location data
      const { data: locationData, error: locationError } = await supabase
        .from('parking_locations')
        .select('*')
        .eq('id', locationId)
        .single();

      if (locationError) throw locationError;
      setParkingData(locationData);

      // Fetch parking spots
      await fetchParkingSpots();
    } catch (error) {
      console.error('Error fetching parking data:', error);
      toast({
        title: "Error",
        description: "Failed to load parking data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchParkingSpots = async () => {
    try {
      const { data: spotsData, error: spotsError } = await supabase
        .from('parking_spots')
        .select('*')
        .eq('location_id', locationId)
        .order('spot_number');

      if (spotsError) throw spotsError;
      setParkingSpots(spotsData || []);
    } catch (error) {
      console.error('Error fetching parking spots:', error);
    }
  };

  const handleSpotClick = (spotNumber: number) => {
    const spot = parkingSpots.find(s => s.spot_number === spotNumber);
    if (spot?.is_occupied && spot.booked_by !== user?.id) {
      return; // Can't select other people's spots
    }

    setSelectedSpot(spotNumber);
  };

  const handleBooking = async () => {
    if (!selectedSpot || !user) return;

    try {
      const { error } = await supabase
        .from('parking_spots')
        .update({
          is_occupied: true,
          booked_by: user.id,
          booking_start: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('location_id', locationId)
        .eq('spot_number', selectedSpot);

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: `Spot ${selectedSpot} has been reserved for you.`,
      });
      setSelectedSpot(null);
    } catch (error) {
      console.error('Error booking spot:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to book the parking spot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSpotStatus = (spotNumber: number) => {
    const spot = parkingSpots.find(s => s.spot_number === spotNumber);
    if (!spot) return 'available';
    
    if (spot.is_occupied && spot.booked_by === user?.id) return 'booked';
    if (spot.is_occupied) return 'occupied';
    if (selectedSpot === spotNumber) return 'selected';
    return 'available';
  };

  const handleCancelBooking = async () => {
  if (!selectedSpot || !user) return;

  try {
    const { error } = await supabase
      .from('parking_spots')
      .update({
        is_occupied: false,
        booked_by: null,
        booking_start: null,
        updated_at: new Date().toISOString()
      })
      .eq('location_id', locationId)
      .eq('spot_number', selectedSpot)
      .eq('booked_by', user.id); // Ensure user can cancel only their own booking

    if (error) throw error;

    toast({
      title: "Booking Cancelled",
      description: `Your reservation for spot ${selectedSpot} has been cancelled.`,
    });

    setSelectedSpot(null);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    toast({
      title: "Cancellation Failed",
      description: "Failed to cancel the booking. Please try again.",
      variant: "destructive",
    });
  }
};


  const getSpotColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-500 cursor-not-allowed';
      case 'booked': return 'bg-blue-500 cursor-pointer hover:bg-blue-600';
      case 'selected': return 'bg-yellow-500 cursor-pointer';
      case 'available': return 'bg-green-500 hover:bg-green-600 cursor-pointer';
      default: return 'bg-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading parking lot...</p>
        </div>
      </div>
    );
  }

  if (!parkingData) {
    return <div>Location not found</div>;
  }

  const totalSpots = parkingData.total_spots;
  const occupiedSpots = parkingSpots.filter(spot => spot.is_occupied).length;
  const availableSpots = totalSpots - occupiedSpots;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/locations" className="flex items-center text-blue-600 hover:text-blue-700">
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Locations
              </Link>
              <div className="text-2xl font-bold text-gray-900">{parkingData.name}</div>
            </div>
            <Button variant="outline" onClick={signOut}>Logout</Button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8 animate-fade-in">
          <Card>
            <CardContent className="p-4 text-center">
              <Car className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{availableSpots}</div>
              <div className="text-sm text-gray-600">Available Spots</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">${parkingData.price_per_hour}</div>
              <div className="text-sm text-gray-600">Per Hour</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-gray-600">Access Hours</div>
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle>Parking Layout</CardTitle>
            <CardDescription>Click on an available spot to select it</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span className="text-sm">Occupied</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm">Your Booking</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span className="text-sm">Selected</span>
              </div>
            </div>

            {/* Parking Grid */}
            <div className="bg-gray-100 p-6 rounded-lg">
              <div className="text-center mb-4 text-gray-600 font-medium">ENTRANCE</div>
              <div className="space-y-4">
                {Array.from({ length: parkingData.rows }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center space-x-2">
                    {Array.from({ length: parkingData.spots_per_row }, (_, spotIndex) => {
                      const spotNumber = rowIndex * parkingData.spots_per_row + spotIndex + 1;
                      const status = getSpotStatus(spotNumber);
                      return (
                        <div
                          key={spotNumber}
                          className={`w-12 h-12 rounded flex items-center justify-center text-white text-xs font-bold transition-all duration-200 transform hover:scale-105 ${getSpotColor(status)}`}
                          onClick={() => handleSpotClick(spotNumber)}
                          title={`Spot ${spotNumber} - ${status}`}
                        >
                          {spotNumber}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="text-center mt-4 text-gray-600 font-medium">EXIT</div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Confirmation */}
        {selectedSpot && (
          <Card className="animate-scale-in border-yellow-300 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Selected Spot: {selectedSpot}</h3>
                  <p className="text-gray-600">Rate: ${parkingData.price_per_hour}/hour</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Book This Spot
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Booking</DialogTitle>
                      <DialogDescription>
                        You're about to book parking spot {selectedSpot} at {parkingData.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Spot Number:</span>
                        <span className="font-semibold">{selectedSpot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span className="font-semibold">${parkingData.price_per_hour}/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-semibold">{parkingData.name}</span>
                      </div>
                      <Button 
                        onClick={handleBooking} 
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Confirm Booking
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}
        {selectedSpot && getSpotStatus(selectedSpot) === 'booked' && (
        <Button 
          variant="destructive" 
          onClick={handleCancelBooking} 
          className="w-full mt-4"
        >
          Cancel Booking
        </Button>
      )}
      </div>
    </div>
  );
};

export default ParkingLot;
