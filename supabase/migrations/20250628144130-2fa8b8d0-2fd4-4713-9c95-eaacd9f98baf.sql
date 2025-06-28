
-- Create a profiles table for user information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a parking_locations table
CREATE TABLE public.parking_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  total_spots INTEGER NOT NULL,
  price_per_hour DECIMAL(10,2) NOT NULL,
  rows INTEGER NOT NULL,
  spots_per_row INTEGER NOT NULL,
  image_url TEXT,
  distance TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a parking_spots table
CREATE TABLE public.parking_spots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES public.parking_locations(id) ON DELETE CASCADE,
  spot_number INTEGER NOT NULL,
  is_occupied BOOLEAN DEFAULT FALSE,
  booked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  booking_start TIMESTAMP WITH TIME ZONE,
  booking_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(location_id, spot_number)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_spots ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Parking locations policies (public read access)
CREATE POLICY "Anyone can view parking locations" ON public.parking_locations
  FOR SELECT USING (true);

-- Parking spots policies
CREATE POLICY "Anyone can view parking spots" ON public.parking_spots
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can book spots" ON public.parking_spots
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Enable realtime for parking_spots table
ALTER TABLE public.parking_spots REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_spots;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample parking locations
INSERT INTO public.parking_locations (name, address, total_spots, price_per_hour, rows, spots_per_row, image_url, distance) VALUES
('Downtown Mall', '123 Main Street, City Center', 50, 5.00, 5, 10, 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop', '0.2 miles'),
('Business District', '456 Corporate Avenue', 30, 8.00, 3, 10, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop', '0.5 miles'),
('City Park', '789 Park Boulevard', 40, 3.00, 4, 10, 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=400&h=250&fit=crop', '0.8 miles'),
('Airport Terminal', 'Airport Road, Terminal 1', 100, 12.00, 10, 10, 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop', '2.3 miles');

-- Insert parking spots for each location
DO $$
DECLARE
    location_record RECORD;
    spot_num INTEGER;
BEGIN
    FOR location_record IN SELECT id, total_spots FROM public.parking_locations LOOP
        FOR spot_num IN 1..location_record.total_spots LOOP
            INSERT INTO public.parking_spots (location_id, spot_number, is_occupied)
            VALUES (location_record.id, spot_num, RANDOM() < 0.3); -- 30% chance of being occupied
        END LOOP;
    END LOOP;
END $$;
