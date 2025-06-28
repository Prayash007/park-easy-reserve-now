
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Car, Clock, DollarSign } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Mock parking lot layout data
const mockParkingData = {
  "1": {
    name: "Downtown Mall",
    pricePerHour: 5,
    layout: {
      rows: 5,
      spotsPerRow: 10,
      occupied: [1, 3, 7, 12, 15, 23, 28, 34, 37, 41, 45],
    }
  },
  "2": {
    name: "Business District",
    pricePerHour: 8,
    layout: {
      rows: 3,
      spotsPerRow: 10,
      occupied: [2, 5, 8, 11, 14, 18, 22, 25, 28],
    }
  },
};

const ParkingLot = () => {
  const { locationId } = useParams();
  const { toast } = useToast();
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [bookedSpots, setBookedSpots] = useState<number[]>([]);
  
  const parkingData = mockParkingData[locationId as keyof typeof mockParkingData];
  
  if (!parkingData) {
    return <div>Location not found</div>;
  }

  const totalSpots = parkingData.layout.rows * parkingData.layout.spotsPerRow;
  const occupiedSpots = [...parkingData.layout.occupied, ...bookedSpots];
  const availableSpots = totalSpots - occupiedSpots.length;

  const handleSpotClick = (spotNumber: number) => {
    if (occupiedSpots.includes(spotNumber)) {
      return; // Can't select occupied spots
    }
    setSelectedSpot(spotNumber);
  };

  const handleBooking = () => {
    if (selectedSpot) {
      setBookedSpots([...bookedSpots, selectedSpot]);
      toast({
        title: "Booking Confirmed!",
        description: `Spot ${selectedSpot} has been reserved for you.`,
      });
      setSelectedSpot(null);
    }
  };

  const getSpotStatus = (spotNumber: number) => {
    if (parkingData.layout.occupied.includes(spotNumber)) return 'occupied';
    if (bookedSpots.includes(spotNumber)) return 'booked';
    if (selectedSpot === spotNumber) return 'selected';
    return 'available';
  };

  const getSpotColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-500 cursor-not-allowed';
      case 'booked': return 'bg-blue-500 cursor-not-allowed';
      case 'selected': return 'bg-yellow-500 cursor-pointer';
      case 'available': return 'bg-green-500 hover:bg-green-600 cursor-pointer';
      default: return 'bg-gray-300';
    }
  };

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
            <Button variant="outline">Logout</Button>
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
              <div className="text-2xl font-bold text-blue-600">${parkingData.pricePerHour}</div>
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
                {Array.from({ length: parkingData.layout.rows }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center space-x-2">
                    {Array.from({ length: parkingData.layout.spotsPerRow }, (_, spotIndex) => {
                      const spotNumber = rowIndex * parkingData.layout.spotsPerRow + spotIndex + 1;
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
                  <p className="text-gray-600">Rate: ${parkingData.pricePerHour}/hour</p>
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
                        <span className="font-semibold">${parkingData.pricePerHour}/hour</span>
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
      </div>
    </div>
  );
};

export default ParkingLot;
