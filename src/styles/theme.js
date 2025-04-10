export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  success: '#34C759',
  error: '#FF3B30',
  border: '#E5E5EA'
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.xl
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.lg
  },
  body: {
    fontSize: 16,
    marginBottom: spacing.md
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold'
  }
};

export const layout = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  column: {
    flexDirection: 'column'
  }
};

export const buttons = {
  primary: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondary: {
    backgroundColor: colors.secondary,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export const images = {
  medium: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginVertical: spacing.md
  },
  small: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginVertical: spacing.sm
  }
};