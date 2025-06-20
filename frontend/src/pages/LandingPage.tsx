import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import { 
  Shield, 
  Eye, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Home, 
  Lock, 
  Clock,
  Users,
  Star,
  ChevronRight
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 scroll-smooth">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Property Escrow</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100">
            Powered by Blockchain Technology
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The Future of Secure Property
            <span className="text-blue-600 block">Transactions</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Instant, tamper-proof escrow powered by blockchain. Trust every deal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              Watch Demo
            </Button>
          </div>
          
          {/* Hero Illustration */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto">
              <div className="grid grid-cols-3 gap-6 items-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Home className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Property</p>
                </div>
                <div className="text-center">
                  <ChevronRight className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Blockchain Escrow</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Secure Transfer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to secure your property transaction with blockchain technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">List or Find Property</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Browse available properties or list your own. Our platform connects buyers, sellers, and agents in one secure environment.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Secure Funds in Escrow</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Deposit funds into our blockchain-powered escrow system. Your money is protected by smart contracts until all conditions are met.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Complete with Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Once all parties approve, funds are automatically released. Every step is transparent and recorded on the blockchain.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Property Escrow */}
      <section id="about" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Property Escrow?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the benefits of blockchain-powered property transactions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tamper-Proof Security</h3>
              <p className="text-gray-600">Blockchain technology ensures your transactions are immutable and secure from fraud.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Transaction Tracking</h3>
              <p className="text-gray-600">Monitor your escrow status in real-time with complete transparency and visibility.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Digital Contracts</h3>
              <p className="text-gray-600">Smart contracts automate the process, reducing delays and eliminating paperwork.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lower Transaction Risk</h3>
              <p className="text-gray-600">Automated escrow reduces human error and ensures all conditions are met before release.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about blockchain-powered property escrow
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">What is blockchain escrow?</AccordionTrigger>
                <AccordionContent>
                  Blockchain escrow uses smart contracts to automatically hold and release funds when predetermined conditions are met. Unlike traditional escrow, it's tamper-proof, transparent, and doesn't require a third-party intermediary to manually process transactions.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">Is my money safe in blockchain escrow?</AccordionTrigger>
                <AccordionContent>
                  Yes, your funds are secured by smart contracts on the Polygon blockchain, which is immutable and transparent. The escrow automatically releases funds only when all parties approve and conditions are met, eliminating the risk of fraud or human error.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">How long does settlement take?</AccordionTrigger>
                <AccordionContent>
                  Once all parties approve the transaction, funds are released instantly through smart contracts. The entire process typically takes minutes rather than days or weeks with traditional escrow services.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">What are the fees?</AccordionTrigger>
                <AccordionContent>
                  Our blockchain escrow fees are significantly lower than traditional services, typically 0.5-1% of the transaction value. You only pay minimal gas fees for blockchain transactions, which are usually under $1 on Polygon.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">Do I need to understand blockchain technology?</AccordionTrigger>
                <AccordionContent>
                  Not at all! Our platform handles all the technical complexity behind the scenes. You simply upload documents, approve transactions, and track progress through our user-friendly interface, just like any other escrow service.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">What happens if there's a dispute?</AccordionTrigger>
                <AccordionContent>
                  Our platform includes built-in dispute resolution with admin oversight capabilities. If parties can't reach agreement, our certified escrow professionals can review the case and make binding decisions, with all actions recorded transparently on the blockchain.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Trusted by Leading Real Estate Professionals</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-lg font-medium text-gray-600">RE/MAX Partners</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-lg font-medium text-gray-600">Century 21 Elite</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-lg font-medium text-gray-600">Coldwell Banker Pro</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-lg font-medium text-gray-600">Keller Williams Tech</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Trusted by Property Professionals</h2>
          
          <div className="max-w-4xl mx-auto mb-16">
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="border-0 shadow-lg h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4">
                        "Property Escrow transformed our real estate transactions. The blockchain security gives our clients complete peace of mind."
                      </p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">Sarah Johnson</p>
                          <p className="text-sm text-gray-600">Real Estate Agent</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>

                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="border-0 shadow-lg h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4">
                        "The transparency and security of blockchain escrow made our property purchase stress-free. Highly recommended!"
                      </p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">Michael Chen</p>
                          <p className="text-sm text-gray-600">Property Buyer</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>

                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="border-0 shadow-lg h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4">
                        "As a legal professional, I appreciate the immutable record-keeping and automated compliance features."
                      </p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">Emily Rodriguez</p>
                          <p className="text-sm text-gray-600">Escrow Attorney</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          {/* Security Badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Blockchain Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Smart Contract Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Secure Your Next Property Deal?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of property professionals who trust blockchain escrow for their transactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Property Escrow</span>
              </div>
              <p className="text-gray-400">
                Secure, transparent property transactions powered by blockchain technology.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Property Escrow. All rights reserved. Powered by blockchain technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
