import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { cryptoConverter } from '../services/cryptoConverter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building, 
  Plus, 
  Search, 
  MapPin, 
  Banknote,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Property {
  id: number;
  property_address: string;
  description: string;
  price: number;
  seller: string;
  is_active: boolean;
  metadata_uri: string;
}

const Properties: React.FC = () => {
  const { user } = useAuth();
  const [properties] = useState<Property[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showPropertyDetail, setShowPropertyDetail] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [priceDisplays, setPriceDisplays] = useState<{ [key: string]: { primary: string; secondary: string } }>({});
  
  const [newProperty, setNewProperty] = useState({
    property_address: '',
    description: '',
    price: '',
    metadata_uri: ''
  });

  const canCreateProperty = user?.role === 'seller' || user?.role === 'admin';

  useEffect(() => {
    const loadPriceConversions = async () => {
      try {
        const conversions = await Promise.all([
          cryptoConverter.getDisplayPrice('1.5'),
          cryptoConverter.getDisplayPrice('2.8'),
          cryptoConverter.getDisplayPrice('0.9')
        ]);
        
        setPriceDisplays({
          '1.5': conversions[0],
          '2.8': conversions[1],
          '0.9': conversions[2]
        });
      } catch (error) {
        console.error('Failed to load price conversions:', error);
      }
    };

    loadPriceConversions();
  }, []);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    setSuccess('');

    try {
      const propertyData = {
        property_address: newProperty.property_address,
        description: newProperty.description,
        price: parseInt(newProperty.price),
        metadata_uri: newProperty.metadata_uri
      };

      const result = await apiService.createProperty(propertyData);
      setSuccess(`Property listed successfully! Transaction hash: ${result.transaction_hash}`);
      setShowCreateDialog(false);
      setNewProperty({
        property_address: '',
        description: '',
        price: '',
        metadata_uri: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create property listing');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleViewDetails = async (property: any) => {
    try {
      const ethAmount = property.price.replace(' ETH', '');
      const priceDisplay = await cryptoConverter.getDisplayPrice(ethAmount);
      
      setSelectedProperty({
        ...property,
        zarPrice: priceDisplay.primary
      });
      setShowPropertyDetail(true);
    } catch (error) {
      console.error('Failed to convert price for modal:', error);
      setSelectedProperty(property);
      setShowPropertyDetail(true);
    }
  };

  const handleCloseDetails = () => {
    setShowPropertyDetail(false);
    setSelectedProperty(null);
  };

  const filteredProperties = properties.filter(property =>
    property.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage property listings and view available properties</p>
        </div>
        {canCreateProperty && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                List Property
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>List New Property</DialogTitle>
                <DialogDescription>
                  Create a new property listing on the blockchain
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProperty} className="space-y-4">
                <div>
                  <label htmlFor="property_address" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Address *
                  </label>
                  <Input
                    id="property_address"
                    value={newProperty.property_address}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, property_address: e.target.value }))}
                    placeholder="123 Main St, City, State"
                    required
                    disabled={createLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <Textarea
                    id="description"
                    value={newProperty.description}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the property..."
                    required
                    disabled={createLoading}
                    rows={3}
                  />
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (in Wei) *
                  </label>
                  <Input
                    id="price"
                    type="number"
                    value={newProperty.price}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="1000000000000000000"
                    required
                    disabled={createLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="metadata_uri" className="block text-sm font-medium text-gray-700 mb-1">
                    Metadata URI
                  </label>
                  <Input
                    id="metadata_uri"
                    value={newProperty.metadata_uri}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, metadata_uri: e.target.value }))}
                    placeholder="https://example.com/metadata.json"
                    disabled={createLoading}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    disabled={createLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLoading}>
                    {createLoading ? 'Creating...' : 'List Property'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Property Detail Modal */}
      <Dialog open={showPropertyDetail} onOpenChange={setShowPropertyDetail}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedProperty?.title}</DialogTitle>
            <DialogDescription className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              {selectedProperty?.address}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge variant={selectedProperty.status === 'Active' ? 'outline' : 'secondary'}>
                  {selectedProperty.status}
                </Badge>
                <div className="flex flex-col items-end">
                  <div className="flex items-center text-xl font-semibold text-green-600">
                    <Banknote className="w-5 h-5 mr-1" />
                    {selectedProperty.zarPrice || 'Loading...'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedProperty.price}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedProperty.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Property Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Property ID:</span>
                    <span className="ml-2 text-gray-600">#{selectedProperty.id}</span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className="ml-2 text-gray-600">{selectedProperty.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleCloseDetails}>
                  Close
                </Button>
                {selectedProperty.status === 'Active' && (
                  <Button>
                    Contact Seller
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search properties by address or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample Property Cards - In a real app, these would come from the blockchain */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Sample Property #1</CardTitle>
              <Badge variant="outline">Active</Badge>
            </div>
            <CardDescription className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              123 Main Street, Anytown, ST 12345
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Beautiful 3-bedroom, 2-bathroom home with modern amenities and a spacious backyard. 
              Perfect for families looking for a comfortable living space.
            </p>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="flex items-center text-lg font-semibold text-green-600">
                  <Banknote className="w-4 h-4 mr-1" />
                  {priceDisplays['1.5']?.primary || 'Loading...'}
                </div>
                <div className="text-sm text-gray-500">
                  {priceDisplays['1.5']?.secondary || '1.5 ETH'}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewDetails({
                  id: 1,
                  title: 'Sample Property #1',
                  address: '123 Main Street, Anytown, ST 12345',
                  description: 'Beautiful 3-bedroom, 2-bathroom home with modern amenities and a spacious backyard. Perfect for families looking for a comfortable living space.',
                  price: '1.5 ETH',
                  status: 'Active'
                })}
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Sample Property #2</CardTitle>
              <Badge variant="outline">Active</Badge>
            </div>
            <CardDescription className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              456 Oak Avenue, Somewhere, ST 67890
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Luxury condo with stunning city views. Features include hardwood floors, 
              granite countertops, and access to building amenities.
            </p>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="flex items-center text-lg font-semibold text-green-600">
                  <Banknote className="w-4 h-4 mr-1" />
                  {priceDisplays['2.8']?.primary || 'Loading...'}
                </div>
                <div className="text-sm text-gray-500">
                  {priceDisplays['2.8']?.secondary || '2.8 ETH'}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewDetails({
                  id: 2,
                  title: 'Sample Property #2',
                  address: '456 Oak Avenue, Somewhere, ST 67890',
                  description: 'Luxury condo with stunning city views. Features include hardwood floors, granite countertops, and access to building amenities.',
                  price: '2.8 ETH',
                  status: 'Active'
                })}
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Sample Property #3</CardTitle>
              <Badge variant="secondary">Pending</Badge>
            </div>
            <CardDescription className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              789 Pine Street, Elsewhere, ST 13579
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Charming starter home with great potential. Recently updated kitchen and 
              bathroom. Close to schools and shopping centers.
            </p>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="flex items-center text-lg font-semibold text-green-600">
                  <Banknote className="w-4 h-4 mr-1" />
                  {priceDisplays['0.9']?.primary || 'Loading...'}
                </div>
                <div className="text-sm text-gray-500">
                  {priceDisplays['0.9']?.secondary || '0.9 ETH'}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewDetails({
                  id: 3,
                  title: 'Sample Property #3',
                  address: '789 Pine Street, Elsewhere, ST 13579',
                  description: 'Charming starter home with great potential. Recently updated kitchen and bathroom. Close to schools and shopping centers.',
                  price: '0.9 ETH',
                  status: 'Pending'
                })}
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredProperties.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms or browse all available properties.
          </p>
        </div>
      )}
    </div>
  );
};

export default Properties;
