-- Enable realtime for rental_properties table
ALTER PUBLICATION supabase_realtime ADD TABLE public.rental_properties;

-- Enable realtime for flats table
ALTER PUBLICATION supabase_realtime ADD TABLE public.flats;

-- Enable realtime for real_estate table
ALTER PUBLICATION supabase_realtime ADD TABLE public.real_estate;