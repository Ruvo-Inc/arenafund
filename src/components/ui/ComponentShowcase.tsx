'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Alert,
  Badge,
  Navigation,
  NavigationItem,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Container,
  Section,
  Grid,
  Flex,
  Stack,
  Center,
  NeuralNetworkIcon,
  ValidationCheckIcon,
  WorkflowIcon,
  AnalyticsIcon,
  InvestmentIcon,
  SecurityIcon,
  StatusIcon,
} from './index';

export default function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    country: '',
    newsletter: false,
    plan: '',
  });

  const selectOptions = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
  ];

  const radioOptions = [
    { value: 'basic', label: 'Basic Plan', description: '$10/month' },
    { value: 'pro', label: 'Pro Plan', description: '$25/month' },
    { value: 'enterprise', label: 'Enterprise Plan', description: '$50/month' },
  ];

  return (
    <Container>
      <Section padding="xl">
        <Stack spacing="xl">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Arena Fund Component Library</h1>
            <p className="text-lg text-muted-foreground">
              A comprehensive collection of reusable UI components built with the Arena Fund design system.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="buttons" active={activeTab === 'buttons'}>
                Buttons
              </TabsTrigger>
              <TabsTrigger value="forms" active={activeTab === 'forms'}>
                Forms
              </TabsTrigger>
              <TabsTrigger value="cards" active={activeTab === 'cards'}>
                Cards
              </TabsTrigger>
              <TabsTrigger value="navigation" active={activeTab === 'navigation'}>
                Navigation
              </TabsTrigger>
              <TabsTrigger value="feedback" active={activeTab === 'feedback'}>
                Feedback
              </TabsTrigger>
              <TabsTrigger value="icons" active={activeTab === 'icons'}>
                Icons
              </TabsTrigger>
              <TabsTrigger value="layout" active={activeTab === 'layout'}>
                Layout
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buttons" active={activeTab === 'buttons'}>
              <Card>
                <CardHeader>
                  <CardTitle>Button Components</CardTitle>
                  <CardDescription>
                    Various button styles and sizes for different use cases.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Stack spacing="lg">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Variants</h3>
                      <Flex gap="md" wrap>
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="success">Success</Button>
                      </Flex>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Sizes</h3>
                      <Flex gap="md" align="center">
                        <Button size="xs">Extra Small</Button>
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                        <Button size="xl">Extra Large</Button>
                      </Flex>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">States</h3>
                      <Flex gap="md">
                        <Button loading>Loading</Button>
                        <Button disabled>Disabled</Button>
                        <Button fullWidth>Full Width</Button>
                      </Flex>
                    </div>
                  </Stack>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forms" active={activeTab === 'forms'}>
              <Card>
                <CardHeader>
                  <CardTitle>Form Components</CardTitle>
                  <CardDescription>
                    Input fields, selects, checkboxes, and other form elements.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Stack spacing="lg">
                    <Grid cols={2} gap="lg">
                      <Input
                        label="Name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </Grid>

                    <Textarea
                      label="Message"
                      placeholder="Enter your message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />

                    <Select
                      label="Country"
                      placeholder="Select your country"
                      options={selectOptions}
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />

                    <Checkbox
                      label="Subscribe to newsletter"
                      description="Get updates about new features and releases"
                      checked={formData.newsletter}
                      onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                    />

                    <RadioGroup
                      name="plan"
                      label="Choose a plan"
                      options={radioOptions}
                      value={formData.plan}
                      onChange={(value) => setFormData({ ...formData, plan: value })}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cards" active={activeTab === 'cards'}>
              <Stack spacing="lg">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Components</CardTitle>
                    <CardDescription>
                      Flexible card layouts for displaying content.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Grid cols={3} gap="lg">
                  <Card variant="default">
                    <CardHeader>
                      <CardTitle>Default Card</CardTitle>
                      <CardDescription>Basic card with border</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This is a default card with standard styling.
                      </p>
                    </CardContent>
                  </Card>

                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Elevated Card</CardTitle>
                      <CardDescription>Card with shadow</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This card has a subtle shadow for elevation.
                      </p>
                    </CardContent>
                  </Card>

                  <Card variant="interactive" hover>
                    <CardHeader>
                      <CardTitle>Interactive Card</CardTitle>
                      <CardDescription>Clickable with hover effects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This card responds to hover and click interactions.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm">Learn More</Button>
                    </CardFooter>
                  </Card>
                </Grid>
              </Stack>
            </TabsContent>

            <TabsContent value="navigation" active={activeTab === 'navigation'}>
              <Stack spacing="lg">
                <Card>
                  <CardHeader>
                    <CardTitle>Navigation Components</CardTitle>
                    <CardDescription>
                      Navigation bars, breadcrumbs, and tabs for site navigation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="lg">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Horizontal Navigation</h3>
                        <Navigation variant="horizontal">
                          <NavigationItem href="/" active>Home</NavigationItem>
                          <NavigationItem href="/about">About</NavigationItem>
                          <NavigationItem href="/services">Services</NavigationItem>
                          <NavigationItem href="/contact">Contact</NavigationItem>
                        </Navigation>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Breadcrumbs</h3>
                        <Breadcrumb>
                          <BreadcrumbItem href="/">Home</BreadcrumbItem>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem href="/products">Products</BreadcrumbItem>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem active>Current Page</BreadcrumbItem>
                        </Breadcrumb>
                      </div>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </TabsContent>

            <TabsContent value="feedback" active={activeTab === 'feedback'}>
              <Stack spacing="lg">
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback Components</CardTitle>
                    <CardDescription>
                      Alerts, badges, and other feedback elements.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="lg">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Alerts</h3>
                        <Stack spacing="md">
                          <Alert variant="default" title="Information">
                            This is a default alert with some information.
                          </Alert>
                          <Alert variant="success" title="Success">
                            Your action was completed successfully.
                          </Alert>
                          <Alert variant="warning" title="Warning">
                            Please review the information before proceeding.
                          </Alert>
                          <Alert variant="error" title="Error">
                            There was an error processing your request.
                          </Alert>
                        </Stack>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Badges</h3>
                        <Flex gap="md" wrap>
                          <Badge variant="default">Default</Badge>
                          <Badge variant="primary">Primary</Badge>
                          <Badge variant="secondary">Secondary</Badge>
                          <Badge variant="success">Success</Badge>
                          <Badge variant="warning">Warning</Badge>
                          <Badge variant="error">Error</Badge>
                          <Badge variant="outline">Outline</Badge>
                        </Flex>
                      </div>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </TabsContent>

            <TabsContent value="icons" active={activeTab === 'icons'}>
              <Stack spacing="lg">
                <Card>
                  <CardHeader>
                    <CardTitle>Icon Library</CardTitle>
                    <CardDescription>
                      Custom B2B AI icons for enterprise workflows, validation, and financial applications.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="lg">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Featured Icons</h3>
                        <Grid cols={6} gap="lg">
                          <div className="text-center space-y-2">
                            <div className="flex justify-center">
                              <NeuralNetworkIcon size={32} />
                            </div>
                            <span className="text-xs text-muted-foreground">Neural Network</span>
                          </div>
                          <div className="text-center space-y-2">
                            <div className="flex justify-center">
                              <ValidationCheckIcon size={32} />
                            </div>
                            <span className="text-xs text-muted-foreground">Validation</span>
                          </div>
                          <div className="text-center space-y-2">
                            <div className="flex justify-center">
                              <WorkflowIcon size={32} />
                            </div>
                            <span className="text-xs text-muted-foreground">Workflow</span>
                          </div>
                          <div className="text-center space-y-2">
                            <div className="flex justify-center">
                              <AnalyticsIcon size={32} />
                            </div>
                            <span className="text-xs text-muted-foreground">Analytics</span>
                          </div>
                          <div className="text-center space-y-2">
                            <div className="flex justify-center">
                              <InvestmentIcon size={32} />
                            </div>
                            <span className="text-xs text-muted-foreground">Investment</span>
                          </div>
                          <div className="text-center space-y-2">
                            <div className="flex justify-center">
                              <SecurityIcon size={32} />
                            </div>
                            <span className="text-xs text-muted-foreground">Security</span>
                          </div>
                        </Grid>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Status Icons</h3>
                        <Flex gap="lg" align="center">
                          <div className="text-center space-y-2">
                            <StatusIcon status="success" size={24} />
                            <span className="text-xs text-muted-foreground">Success</span>
                          </div>
                          <div className="text-center space-y-2">
                            <StatusIcon status="warning" size={24} />
                            <span className="text-xs text-muted-foreground">Warning</span>
                          </div>
                          <div className="text-center space-y-2">
                            <StatusIcon status="error" size={24} />
                            <span className="text-xs text-muted-foreground">Error</span>
                          </div>
                          <div className="text-center space-y-2">
                            <StatusIcon status="info" size={24} />
                            <span className="text-xs text-muted-foreground">Info</span>
                          </div>
                          <div className="text-center space-y-2">
                            <StatusIcon status="pending" size={24} />
                            <span className="text-xs text-muted-foreground">Pending</span>
                          </div>
                        </Flex>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Usage Example</h3>
                        <div className="bg-secondary rounded-lg p-4">
                          <pre className="text-sm">
{`import { NeuralNetworkIcon, StatusIcon } from '@/components/ui';

<NeuralNetworkIcon size={24} color="#1e3a8a" />
<StatusIcon status="success" size={20} />`}
                          </pre>
                        </div>
                      </div>

                      <div className="text-center">
                        <Button variant="outline" size="sm">
                          View Full Icon Library
                        </Button>
                      </div>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </TabsContent>

            <TabsContent value="layout" active={activeTab === 'layout'}>
              <Stack spacing="lg">
                <Card>
                  <CardHeader>
                    <CardTitle>Layout Components</CardTitle>
                    <CardDescription>
                      Containers, grids, and layout utilities for organizing content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="lg">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Grid Layout</h3>
                        <Grid cols={4} gap="md">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div
                              key={i}
                              className="bg-secondary rounded-lg p-4 text-center text-sm"
                            >
                              Grid Item {i + 1}
                            </div>
                          ))}
                        </Grid>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Flex Layout</h3>
                        <Flex justify="between" align="center" className="bg-secondary rounded-lg p-4">
                          <span>Left Content</span>
                          <span>Center Content</span>
                          <span>Right Content</span>
                        </Flex>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Stack Layout</h3>
                        <Stack spacing="md" className="bg-secondary rounded-lg p-4">
                          <div>Stack Item 1</div>
                          <div>Stack Item 2</div>
                          <div>Stack Item 3</div>
                        </Stack>
                      </div>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </TabsContent>
          </Tabs>
        </Stack>
      </Section>
    </Container>
  );
}