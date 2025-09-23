# Alert & Toast Notification Documentation

## 📱 **Alert Component Features**

### ✨ **What's Included:**
- 🎨 **4 Alert Types**: Success, Error, Warning, Info
- 🎭 **Smooth Animations**: Framer Motion powered
- 📍 **6 Positions**: Top/Bottom × Left/Center/Right
- ⏰ **Auto-close**: Configurable timeout
- 🎯 **Icons**: Contextual icons for each type
- 📊 **Progress Bar**: Visual countdown for auto-close
- 🔐 **Close Button**: Manual dismiss option
- 📱 **Responsive**: Mobile-friendly design

## 🚀 **Quick Start**

### **1. Import Components**
```jsx
import { Alert, useToast } from '../components/ui';
```

### **2. Basic Toast Usage**
```jsx
const MyComponent = () => {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Berhasil!', 'Data berhasil disimpan');
  };

  const handleError = () => {
    toast.error('Gagal!', 'Terjadi kesalahan');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      
      {/* Required: Toast Container */}
      <toast.ToastContainer />
    </div>
  );
};
```

### **3. Static Alert Usage**
```jsx
const [showAlert, setShowAlert] = useState(false);

return (
  <Alert
    type="success"
    title="Berhasil!"
    message="Operasi berhasil dilakukan"
    isVisible={showAlert}
    onClose={() => setShowAlert(false)}
    position="top-center"
  />
);
```

## 🎨 **Alert Types & Styling**

### **Success** 🟢
- **Color**: Green theme
- **Icon**: Check mark
- **Use**: Successful operations

### **Error** 🔴  
- **Color**: Red theme
- **Icon**: X mark
- **Use**: Failed operations, validation errors

### **Warning** 🟡
- **Color**: Yellow theme  
- **Icon**: Alert triangle
- **Use**: Cautions, confirmations needed

### **Info** 🔵
- **Color**: Blue theme
- **Icon**: Info circle
- **Use**: General information, tips

## 📍 **Position Options**

```jsx
// Available positions:
position="top-right"     // Default
position="top-left"
position="top-center"
position="bottom-right"
position="bottom-left" 
position="bottom-center"
```

## ⚙️ **Configuration Options**

### **Alert Props**
```jsx
<Alert
  type="success"              // 'success' | 'error' | 'warning' | 'info'
  title="Alert Title"         // Optional title
  message="Alert message"     // Main message
  isVisible={true}           // Show/hide alert
  onClose={() => {}}         // Close callback
  autoClose={true}           // Auto-dismiss
  duration={5000}            // Auto-close timeout (ms)
  position="top-right"       // Position on screen
  showIcon={true}            // Show/hide icon
  showCloseButton={true}     // Show/hide close button
  className=""               // Additional CSS classes
/>
```

### **Toast Methods**
```jsx
const toast = useToast();

// All methods support same options
toast.success(title, message, options);
toast.error(title, message, options);
toast.warning(title, message, options);
toast.info(title, message, options);

// Options example:
toast.success('Title', 'Message', {
  duration: 3000,
  position: 'top-center',
  autoClose: false
});
```

## 💡 **Usage Examples**

### **CRUD Operations**
```jsx
// Create User
try {
  await createUser(userData);
  toast.success('Berhasil!', `User "${userData.name}" berhasil dibuat`);
} catch (error) {
  toast.error('Gagal!', error.message);
}

// Update User  
try {
  await updateUser(id, userData);
  toast.success('Berhasil!', 'User berhasil diupdate');
} catch (error) {
  toast.error('Gagal!', 'Gagal mengupdate user');
}

// Delete User
try {
  await deleteUser(id);
  toast.success('Berhasil!', 'User berhasil dihapus');
} catch (error) {
  toast.error('Gagal!', 'Gagal menghapus user');
}
```

### **Form Validation**
```jsx
const handleSubmit = (formData) => {
  if (!formData.email) {
    toast.warning('Peringatan!', 'Email wajib diisi');
    return;
  }
  
  if (!isValidEmail(formData.email)) {
    toast.error('Error!', 'Format email tidak valid');
    return;
  }
  
  // Submit form...
  toast.success('Berhasil!', 'Form berhasil dikirim');
};
```

### **System Notifications**
```jsx
// Connection status
toast.info('Info', 'Menghubungkan ke server...');

// Maintenance warning
toast.warning('Peringatan!', 'Sistem akan maintenance dalam 10 menit');

// Update available
toast.info('Update', 'Versi baru tersedia!');
```

## 🎭 **Advanced Features**

### **Custom Duration**
```jsx
toast.success('Quick', 'Fast message', { duration: 2000 });
toast.info('Slow', 'Long message', { duration: 10000 });
```

### **No Auto-Close**
```jsx
toast.error('Critical', 'Manual close only', { autoClose: false });
```

### **Custom Position**
```jsx
toast.warning('Mobile', 'Bottom message', { position: 'bottom-center' });
```

### **Remove Specific Toast**
```jsx
const toastId = toast.success('Removable', 'Can be removed manually');
setTimeout(() => toast.removeToast(toastId), 2000);
```

## 📱 **Mobile Responsiveness**

- ✅ **Touch-friendly** close buttons
- ✅ **Proper spacing** on small screens  
- ✅ **Readable font sizes** on mobile
- ✅ **Swipe gesture** support (future enhancement)

## 🎨 **Customization**

### **Custom Styling**
```jsx
<Alert
  className="shadow-2xl border-2"
  type="success"
  title="Custom"
  message="Custom styled alert"
/>
```

### **Theme Integration**
The alerts automatically adapt to your design system colors:
- Uses Tailwind CSS color palette
- Consistent with other UI components
- Dark mode ready (future enhancement)

## 🚀 **Best Practices**

1. **✅ Use descriptive titles** - Help users understand the context
2. **✅ Keep messages concise** - Mobile users have limited space  
3. **✅ Choose appropriate types** - Success for achievements, Error for failures
4. **✅ Include ToastContainer** - Required for toast notifications
5. **✅ Handle loading states** - Show feedback during async operations

## 🔄 **Migration from SweetAlert**

Replace SweetAlert calls with our toast system:

```jsx
// Before (SweetAlert)
Swal.fire('Success!', 'User created successfully', 'success');

// After (Our Toast)
toast.success('Berhasil!', 'User berhasil dibuat');
```

---

**Ready to enhance your UX with beautiful alerts! 🎉**