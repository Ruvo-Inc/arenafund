import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock API endpoints - Support both absolute and relative URLs
  http.post('http://localhost:3000/api/applications', () => {
    return HttpResponse.json({ id: 'test-app-id' }, { status: 201 })
  }),
  
  http.post('/api/applications', () => {
    return HttpResponse.json({ id: 'test-app-id' }, { status: 201 })
  }),

  http.post('http://localhost:3000/api/upload/signed-url', () => {
    return HttpResponse.json({
      uploadUrl: 'https://storage.googleapis.com/signed-upload-url',
      fileRef: 'applications/uploads/test-file.pdf',
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      maxSize: 25 * 1024 * 1024,
      allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
    })
  }),
  
  http.post('/api/upload/signed-url', () => {
    return HttpResponse.json({
      uploadUrl: 'https://storage.googleapis.com/signed-upload-url',
      fileRef: 'applications/uploads/test-file.pdf',
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      maxSize: 25 * 1024 * 1024,
      allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
    })
  }),

  // Mock file upload to signed URL
  http.put('https://storage.googleapis.com/signed-upload-url', () => {
    return new HttpResponse(null, { status: 200 })
  }),

  // Mock webhook notifications
  http.post('https://hooks.test.com/webhook', () => {
    return HttpResponse.json({ success: true })
  }),

  // Mock Firebase Admin SDK calls
  http.post('https://firestore.googleapis.com/v1/projects/test-project/databases/(default)/documents:runTransaction', () => {
    return HttpResponse.json({
      result: {
        writeResults: [{ updateTime: '2024-01-01T00:00:00Z' }]
      }
    })
  }),

  // Mock Firestore document creation
  http.post('https://firestore.googleapis.com/v1/projects/test-project/databases/(default)/documents/applications', () => {
    return HttpResponse.json({
      name: 'projects/test-project/databases/(default)/documents/applications/test-app-id',
      fields: {
        id: { stringValue: 'test-app-id' },
        createdAt: { timestampValue: '2024-01-01T00:00:00Z' }
      },
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z'
    })
  }),

  // Mock Google Cloud Storage signed URL generation
  http.post('https://storage.googleapis.com/storage/v1/b/test-project.appspot.com/o/applications%2Fuploads%2F*', () => {
    return HttpResponse.json({
      name: 'applications/uploads/test-file.pdf',
      bucket: 'test-project.appspot.com',
      generation: '1234567890',
      metageneration: '1',
      contentType: 'application/pdf',
      timeCreated: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z',
      size: '1024'
    })
  }),

  // Mock email queue service
  http.post('https://api.test-email-service.com/send', () => {
    return HttpResponse.json({ 
      messageId: 'test-message-id',
      status: 'queued'
    })
  })
]