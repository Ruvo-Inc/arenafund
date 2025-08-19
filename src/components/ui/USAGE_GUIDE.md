# Arena Fund UI Component Library - Usage Guide

This guide provides practical examples and best practices for using the Arena Fund UI component library in your applications.

## Quick Start

### 1. Import Components

```tsx
// Import individual components
import { Button, Input, Card } from '@/components/ui';

// Or import specific components
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
```

### 2. Basic Usage

```tsx
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Form</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input label="Name" placeholder="Enter your name" />
          <Input label="Email" type="email" placeholder="Enter your email" />
          <Button variant="primary" fullWidth>
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Component Examples

### Buttons

```tsx
// Basic buttons
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width</Button>

// With icons
<Button leftIcon={<PlusIcon />}>Add Item</Button>
<Button rightIcon={<ArrowRightIcon />}>Continue</Button>
```

### Form Components

```tsx
// Input with validation
const [email, setEmail] = useState('');
const [error, setError] = useState('');

<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
  helperText="We'll never share your email"
  leftIcon={<MailIcon />}
/>

// Textarea
<Textarea
  label="Message"
  placeholder="Enter your message"
  rows={4}
  helperText="Maximum 500 characters"
/>

// Select dropdown
<Select
  label="Country"
  placeholder="Select your country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' }
  ]}
/>

// Checkbox
<Checkbox
  label="I agree to the terms and conditions"
  description="By checking this box, you agree to our Terms of Service"
/>

// Radio group
<RadioGroup
  name="plan"
  label="Choose a plan"
  options={[
    { value: 'basic', label: 'Basic Plan', description: '$10/month' },
    { value: 'pro', label: 'Pro Plan', description: '$25/month' }
  ]}
  value={selectedPlan}
  onChange={setSelectedPlan}
/>
```

### Cards

```tsx
// Basic card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Interactive card with hover effects
<Card variant="interactive" hover>
  <CardContent>
    <h3>Clickable Card</h3>
    <p>This card responds to hover and click</p>
  </CardContent>
</Card>

// Elevated card
<Card variant="elevated" padding="lg">
  <CardContent>
    <h3>Elevated Card</h3>
    <p>This card has a shadow for emphasis</p>
  </CardContent>
</Card>
```

### Layout Components

```tsx
// Container with responsive sizing
<Container size="content">
  <Section padding="lg">
    <h1>Page Content</h1>
  </Section>
</Container>

// Grid layout
<Grid cols={3} gap="lg" responsive>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>

// Flex layout
<Flex justify="between" align="center" gap="md">
  <div>Left content</div>
  <div>Right content</div>
</Flex>

// Stack layout
<Stack spacing="lg">
  <h2>Title</h2>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
  <Button>Action</Button>
</Stack>

// Center content
<Center axis="both" className="h-64">
  <div>Centered content</div>
</Center>
```

### Navigation

```tsx
// Horizontal navigation
<Navigation variant="horizontal">
  <NavigationItem href="/" active>Home</NavigationItem>
  <NavigationItem href="/about">About</NavigationItem>
  <NavigationItem href="/contact">Contact</NavigationItem>
</Navigation>

// Breadcrumbs
<Breadcrumb>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem href="/products">Products</BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem active>Current Page</BreadcrumbItem>
</Breadcrumb>

// Tabs
const [activeTab, setActiveTab] = useState('tab1');

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1" active={activeTab === 'tab1'}>Tab 1</TabsTrigger>
    <TabsTrigger value="tab2" active={activeTab === 'tab2'}>Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1" active={activeTab === 'tab1'}>
    Content for tab 1
  </TabsContent>
  <TabsContent value="tab2" active={activeTab === 'tab2'}>
    Content for tab 2
  </TabsContent>
</Tabs>
```

### Feedback Components

```tsx
// Alerts
<Alert variant="success" title="Success!">
  Your changes have been saved successfully.
</Alert>

<Alert variant="warning" title="Warning" dismissible onDismiss={() => {}}>
  Please review your information before proceeding.
</Alert>

<Alert variant="error" title="Error">
  There was an error processing your request.
</Alert>

// Badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Inactive</Badge>
<Badge variant="outline" size="sm">New</Badge>
```

## Common Patterns

### Form with Validation

```tsx
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Submit form
      await submitForm(formData);
    } catch (error) {
      setErrors({ submit: 'Failed to submit form' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />
            <Textarea
              label="Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              error={errors.message}
              rows={4}
              required
            />
            <Button type="submit" loading={isSubmitting} fullWidth>
              Send Message
            </Button>
            {errors.submit && (
              <Alert variant="error">{errors.submit}</Alert>
            )}
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Dashboard Layout

```tsx
function Dashboard() {
  return (
    <Container size="content">
      <Section padding="lg">
        <Stack spacing="xl">
          {/* Header */}
          <Flex justify="between" align="center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back!</p>
            </div>
            <Button variant="primary">New Project</Button>
          </Flex>

          {/* Stats Grid */}
          <Grid cols={4} gap="lg">
            <Card>
              <CardContent>
                <div className="text-2xl font-bold">$12,345</div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-sm text-muted-foreground">Projects</p>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Content */}
          <Grid cols={2} gap="lg">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Stack spacing="sm">
                  <div className="flex justify-between">
                    <span>User signed up</span>
                    <Badge variant="success">New</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment received</span>
                    <Badge variant="success">Completed</Badge>
                  </div>
                </Stack>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Stack spacing="sm">
                  <Button variant="outline" fullWidth>
                    Create New Project
                  </Button>
                  <Button variant="outline" fullWidth>
                    Invite Team Member
                  </Button>
                  <Button variant="outline" fullWidth>
                    View Reports
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Stack>
      </Section>
    </Container>
  );
}
```

### Modal Dialog Pattern

```tsx
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Flex justify="between" align="center">
            <CardTitle>Modal Title</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </Flex>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        <CardFooter>
          <Flex gap="sm" justify="end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary">
              Confirm
            </Button>
          </Flex>
        </CardFooter>
      </Card>
    </div>
  );
}
```

## Styling and Customization

### Using className for Custom Styles

```tsx
// Add custom classes
<Button className="shadow-lg hover:shadow-xl">
  Custom Button
</Button>

// Override specific styles
<Card className="border-2 border-primary">
  Highlighted Card
</Card>
```

### Responsive Design

```tsx
// Responsive grid
<Grid cols={1} className="md:grid-cols-2 lg:grid-cols-3">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>

// Responsive spacing
<Stack spacing="sm" className="md:space-y-6 lg:space-y-8">
  <div>Content</div>
</Stack>
```

### Dark Mode Support

All components automatically support dark mode through CSS custom properties. The design tokens will automatically switch based on the user's preference.

## Performance Tips

1. **Import only what you need**:
   ```tsx
   // Good
   import { Button } from '@/components/ui';
   
   // Avoid importing everything
   import * as UI from '@/components/ui';
   ```

2. **Use React.memo for static content**:
   ```tsx
   const StaticCard = React.memo(({ title, content }) => (
     <Card>
       <CardHeader>
         <CardTitle>{title}</CardTitle>
       </CardHeader>
       <CardContent>{content}</CardContent>
     </Card>
   ));
   ```

3. **Lazy load heavy components**:
   ```tsx
   const ComponentShowcase = React.lazy(() => import('@/components/ui/ComponentShowcase'));
   ```

## Accessibility Best Practices

1. **Always provide labels**:
   ```tsx
   <Input label="Email Address" />
   <Checkbox label="I agree to terms" />
   ```

2. **Use semantic HTML**:
   ```tsx
   <Navigation>
     <NavigationItem href="/">Home</NavigationItem>
   </Navigation>
   ```

3. **Provide proper ARIA attributes**:
   ```tsx
   <Button aria-label="Close dialog">×</Button>
   ```

4. **Test with keyboard navigation**:
   All components support keyboard navigation out of the box.

## Troubleshooting

### Common Issues

1. **TypeScript errors with props**:
   - Make sure you're using the correct prop names and types
   - Check the component's TypeScript interface

2. **Styling not applying**:
   - Ensure Tailwind CSS is properly configured
   - Check that design tokens are imported

3. **Components not rendering**:
   - Verify all required props are provided
   - Check for JavaScript errors in the console

### Getting Help

1. Check the component showcase for examples
2. Review the TypeScript definitions
3. Look at the component source code
4. Test components in isolation first